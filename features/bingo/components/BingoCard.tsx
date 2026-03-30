import { Dimensions, Image, Pressable, TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/Text';
import EditIcon from '@/assets/icons/ic_edit.svg';
import { BingoData } from '@/types/bingo';
import {
  getThemeImage,
  getThemeForegroundColor,
  FIGMA_W,
  FIGMA_H,
  GRID_CONFIGS,
} from '../lib/theme-config';
import { DonutStat } from './DonutStat';

/** grid별 최대 빙고 수 (행 + 열 + 대각선(정사각형만)) */
function calcMaxBingo(cols: number, rows: number): number {
  return cols + rows + (cols === rows ? 2 : 0);
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** startDate~targetDate 기준 [오늘까지 경과일, 전체 기간] 계산 */
function calcDayProgress(startDate: string | null, targetDate: string | null): [number, number] {
  if (!startDate || !targetDate) return [0, 0];
  const start = new Date(startDate).getTime();
  const end = new Date(targetDate).getTime();
  const total = Math.max(Math.round((end - start) / DAY_MS), 1);
  const elapsed = Math.min(Math.max(Math.round((Date.now() - start) / DAY_MS), 0), total);
  return [elapsed, total];
}

/** 'YYYY-MM-DD' → 'YY.MM.DD' */
function formatDate(date: string | null): string {
  if (!date) return '';
  const [y, m, d] = date.split('-');
  return `${y.slice(2)}.${m}.${d}`;
}

interface BingoCardProps {
  bingo: BingoData;
  completedCells?: boolean[];
  onCellPress: (index: number) => void;
  onEditPress?: () => void;
}

export function BingoCard({
  bingo,
  completedCells = [],
  onCellPress,
  onEditPress,
}: BingoCardProps) {
  const fgColor = getThemeForegroundColor(bingo.theme);
  const [cols, rows] = bingo.grid.split('x').map(Number);
  const textStyle = bingo.grid === '3x3' ? 'text-body-sm' : 'text-caption-md';
  const screenWidth = Dimensions.get('window').width;
  const image = getThemeImage(bingo.theme, bingo.grid);
  const checkImage = getThemeImage(bingo.theme, 'check');

  const [dayElapsed, dayTotal] = calcDayProgress(bingo.startDate, bingo.targetDate);
  const formattedEndDate = formatDate(bingo.targetDate);

  if (image !== null) {
    const scale = screenWidth / FIGMA_W;
    const cardHeight = FIGMA_H * scale;
    const cfg = GRID_CONFIGS[bingo.grid];
    const gridTop = cfg.top * scale;
    const gridLeft = cfg.left * scale;
    const cellW = cfg.cellW * scale;
    const cellH = cfg.cellH * scale;
    const gapX = cfg.gapX * scale;
    const gapY = cfg.gapY * scale;

    return (
      <View className="pb-24">
        {/* 이미지 + 셀 오버레이 */}
        <View style={{ width: screenWidth, height: cardHeight }}>
          <Image
            source={image}
            style={{ position: 'absolute', width: '100%', height: '100%' }}
            resizeMode="cover"
          />

          {/* 제목 + 편집 아이콘 */}
          <View className="pt-5 px-5 items-center justify-between flex-row absolute w-full">
            <Text className="text-title-md" style={{ color: fgColor }}>
              {bingo.title}
            </Text>
            {onEditPress && (
              <TouchableOpacity onPress={onEditPress} hitSlop={8}>
                <EditIcon width={18} height={18} color={fgColor} />
              </TouchableOpacity>
            )}
          </View>

          {/* 빙고 그리드 */}
          {Array.from({ length: cols * rows }).map((_, i) => {
            const col = i % cols;
            const row = Math.floor(i / cols);
            return (
              <Pressable
                key={i}
                onPress={() => onCellPress(i)}
                style={{
                  position: 'absolute',
                  left: gridLeft + col * (cellW + gapX),
                  top: gridTop + row * (cellH + gapY),
                  width: cellW,
                  height: cellH,
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 8 /* px-2 */,
                }}
              >
                <Text
                  className={`${textStyle} text-center`}
                  style={{ color: '#181C1C' /* gray-900 */ }}
                  numberOfLines={3}
                >
                  {bingo.cells[i] ?? ''}
                </Text>
                {completedCells[i] && checkImage && (
                  <Image
                    source={checkImage}
                    style={{ position: 'absolute', width: '100%', height: '100%' }}
                    resizeMode="contain"
                  />
                )}
              </Pressable>
            );
          })}
        </View>

        {/* 스탯 — 이미지 외부 */}
        <View className="mt-4">
          <View className="flex-row">
            <View className="flex-1 items-center">
              <DonutStat label="달성" current={bingo.achievedCount} total={cols * rows} />
            </View>
            <View className="flex-1 items-center">
              <DonutStat
                label="빙고"
                current={bingo.bingoCount}
                total={calcMaxBingo(cols, rows)}
                overflowRed
              />
            </View>
            <View className="flex-1 items-center">
              <DonutStat label="종료일" current={dayElapsed} total={dayTotal} />
            </View>
          </View>
          {formattedEndDate ? (
            <View className="items-end px-5 mt-4">
              <Text className="text-caption-sm text-gray-600">{formattedEndDate}</Text>
            </View>
          ) : null}
        </View>
      </View>
    );
  }
}
