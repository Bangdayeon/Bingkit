import { Dimensions, Pressable, TouchableOpacity, View } from 'react-native';
import Text from '@/components/common/Text';
import AddIcon from '@/assets/icons/ic_add.svg';

export interface BingoData {
  id: string;
  title: string;
  grid: string;
  cells: string[];
  maxEdits: number;
  achievedCount: number;
  bingoCount: number;
  dday: number;
}

interface BingoCardProps {
  bingo: BingoData;
  onPress: () => void;
  onEditPress: () => void;
}

export default function BingoCard({ bingo, onPress, onEditPress }: BingoCardProps) {
  const [cols, rows] = bingo.grid.split('x').map(Number);
  const gap = 6;
  const availableWidth = Dimensions.get('window').width - 40;
  const cellSize = (availableWidth - gap * (cols - 1)) / cols;
  const textStyle = bingo.grid === '3x3' ? 'text-body-sm' : 'text-caption-md';

  return (
    <View className="mb-10">
      {/* 제목 + 편집 아이콘 */}
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-title-md">{bingo.title}</Text>
        <TouchableOpacity onPress={onEditPress} hitSlop={8}>
          <AddIcon width={18} height={18} />
        </TouchableOpacity>
      </View>

      {/* 빙고 그리드 (클릭 가능) */}
      <Pressable onPress={onPress}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap }}>
          {Array.from({ length: cols * rows }).map((_, i) => (
            <View
              key={i}
              style={{
                width: cellSize,
                height: cellSize,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: '#d2d6d6',
                backgroundColor: '#fdfdfd',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 4,
              }}
            >
              <Text className={`${textStyle} text-center`} numberOfLines={3}>
                {bingo.cells[i] ?? ''}
              </Text>
            </View>
          ))}
        </View>
      </Pressable>

      {/* 스탯 */}
      <View className="flex-row mt-4">
        <View className="flex-1 items-center gap-1">
          <Text className="text-label-sm">달성</Text>
          <Text className="text-body-sm">
            {bingo.achievedCount}/{cols * rows}
          </Text>
        </View>
        <View className="flex-1 items-center gap-1">
          <Text className="text-label-sm">빙고</Text>
          <Text className="text-body-sm">{bingo.bingoCount}</Text>
        </View>
        <View className="flex-1 items-center gap-1">
          <Text className="text-label-sm">D-day</Text>
          <Text className="text-body-sm">{bingo.dday}</Text>
        </View>
      </View>
    </View>
  );
}
