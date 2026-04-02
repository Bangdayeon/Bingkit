// BingoPreview.tsx (수정)

import { View, Text, Image, Pressable } from 'react-native';
import { useEffect, useState } from 'react';
import { BingoData } from '@/types/bingo';
import { FIGMA_W, FIGMA_H, GRID_CONFIGS, getThemeImageUrl } from '@/features/bingo/lib/theme';

interface BingoPreviewProps {
  bingo: BingoData;
  completedCells?: boolean[];
  size?: string;
  onPress?: () => void;
}

export default function BingoPreview({
  bingo,
  completedCells = [],
  size = 'w-full',
  onPress,
}: BingoPreviewProps) {
  const [image, setImage] = useState<string | null>(null);
  const [checkImage, setCheckImage] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const [bg, check] = await Promise.all([
        getThemeImageUrl(bingo.theme, bingo.grid as '3x3' | '4x3' | '4x4'),
        getThemeImageUrl(bingo.theme, 'check'),
      ]);
      setImage(bg);
      setCheckImage(check);
    };
    load();
  }, [bingo.theme, bingo.grid]);

  const [cols, rows] = bingo.grid.split('x').map(Number);
  const Wrapper = onPress ? Pressable : View;

  if (image) {
    const cfg = GRID_CONFIGS[bingo.grid];

    return (
      <Wrapper className={size} {...(onPress ? { onPress } : {})}>
        <View style={{ width: '100%', aspectRatio: FIGMA_W / FIGMA_H }}>
          <Image
            source={{ uri: image }}
            style={{ position: 'absolute', width: '100%', height: '100%' }}
            resizeMode="cover"
          />

          <Text
            style={{
              position: 'absolute',
              top: `${(20 / FIGMA_H) * 100}%`,
              left: `${(20 / FIGMA_W) * 100}%`,
            }}
          >
            {bingo.title}
          </Text>

          {Array.from({ length: cols * rows }).map((_, i: number) => {
            const col = i % cols;
            const row = Math.floor(i / cols);

            return (
              <View
                key={i}
                style={{
                  position: 'absolute',
                  left: `${((cfg.left + col * (cfg.cellW + cfg.gapX)) / FIGMA_W) * 100}%`,
                  top: `${((cfg.top + row * (cfg.cellH + cfg.gapY)) / FIGMA_H) * 100}%`,
                  width: `${(cfg.cellW / FIGMA_W) * 100}%`,
                  height: `${(cfg.cellH / FIGMA_H) * 100}%`,
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 4,
                }}
              >
                <Text
                  className="text-caption-sm text-center"
                  style={{ color: '#181C1C' }}
                  numberOfLines={2}
                >
                  {bingo.cells[i] ?? ''}
                </Text>

                {completedCells[i] && checkImage && (
                  <Image
                    source={{ uri: checkImage }}
                    style={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                    }}
                    resizeMode="contain"
                  />
                )}
              </View>
            );
          })}
        </View>
      </Wrapper>
    );
  }

  return (
    <Wrapper className={`${size} flex-row flex-wrap gap-1`} {...(onPress ? { onPress } : {})}>
      {bingo.cells.map((text: string, i: number) => (
        <View
          key={i}
          style={{
            width: `${100 / cols}%`,
            aspectRatio: 1,
            borderRadius: 4,
            borderWidth: 1,
            borderColor: '#D2D6D6',
            backgroundColor: '#FDFDFD',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 4,
          }}
        >
          <Text
            className="text-caption-sm text-center"
            style={{ color: '#181C1C' }}
            numberOfLines={2}
          >
            {text}
          </Text>
        </View>
      ))}
    </Wrapper>
  );
}
