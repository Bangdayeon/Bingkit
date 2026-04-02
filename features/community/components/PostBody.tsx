import { useEffect, useState } from 'react';
import { Dimensions, Image, ScrollView, View } from 'react-native';
import { Text } from '@/components/Text';
import SMSIcon from '@/assets/icons/ic_sms.svg';
import { LikeButton } from './LikeButton';
import { AnonymousProfile } from '@/components/AnonymousProfile';
import { ProfileAvatar } from '@/components/ProfileAvatar';
import { CommunityPost } from '@/types/community';
import { getThemeImageUrl, FIGMA_W, FIGMA_H, GRID_CONFIGS } from '@/features/bingo/lib/theme';
import { GridType } from '@/types/bingo-cell';

const ICON_SIZE = 20;

// GridType 타입 가드
function isGridType(grid: string): grid is GridType {
  return ['3x3', '4x3', '4x4', 'check'].includes(grid);
}

function BingoBoardPreview({
  cells,
  grid,
  theme,
}: {
  cells: string[];
  grid: string;
  theme: string;
}) {
  if (!isGridType(grid)) return null;
  const [cols, rows] = grid.split('x').map(Number);
  const availableWidth = Dimensions.get('window').width - 40;
  const [imageUri, setImageUri] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    getThemeImageUrl(theme, grid).then((uri) => {
      if (mounted) setImageUri(uri);
    });
    return () => {
      mounted = false;
    };
  }, [theme, grid]);

  const cfg = GRID_CONFIGS[grid];
  if (!cfg) return null;

  const scale = availableWidth / FIGMA_W;
  const cardHeight = FIGMA_H * scale;
  const gridTop = cfg.top * scale;
  const gridLeft = cfg.left * scale;
  const cellW = cfg.cellW * scale;
  const cellH = cfg.cellH * scale;
  const gapX = cfg.gapX * scale;
  const gapY = cfg.gapY * scale;

  return (
    <View style={{ width: availableWidth, height: cardHeight, marginTop: 12 }}>
      {imageUri && (
        <Image
          source={{ uri: imageUri }}
          style={{ position: 'absolute', width: '100%', height: '100%' }}
          resizeMode="cover"
        />
      )}
      {Array.from({ length: cols * rows }).map((_, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        return (
          <View
            key={i}
            style={{
              position: 'absolute',
              left: gridLeft + col * (cellW + gapX),
              top: gridTop + row * (cellH + gapY),
              width: cellW,
              height: cellH,
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
              {cells[i] ?? ''}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

interface PostBodyProps {
  post: CommunityPost;
  iconColor: string;
}

export function PostBody({ post, iconColor }: PostBodyProps) {
  return (
    <View className="px-5 pt-4">
      <View className="flex-row items-center gap-2">
        {post.isAnonymous ? (
          <AnonymousProfile seed={post.id} size="md" />
        ) : (
          <ProfileAvatar avatarUrl={post.avatarUrl ?? null} size={32} />
        )}
        <Text className="text-label-sm">{post.author}</Text>
        <Text className="text-caption-sm" style={{ color: '#181C1C' }}>
          •
        </Text>
        <Text className="text-caption-sm" style={{ color: '#929898' }}>
          {post.timeAgo}
        </Text>
      </View>

      <Text className="text-title-md mt-3">{post.title}</Text>

      {post.bingo && (
        <BingoBoardPreview
          cells={post.bingo.cells}
          grid={post.bingo.grid}
          theme={post.bingo.theme}
        />
      )}

      {!post.bingo && post.imageUrls?.length ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: 12 }}
          contentContainerStyle={{ gap: 8 }}
        >
          {post.imageUrls.map((url, i) => (
            <Image
              key={i}
              source={{ uri: url }}
              style={{ width: 260, height: 200, borderRadius: 8 }}
              resizeMode="cover"
            />
          ))}
        </ScrollView>
      ) : null}

      <Text className="text-body-sm mt-3">{post.body}</Text>

      <View className="flex-row items-center gap-4 mt-3">
        <LikeButton
          count={post.likeCount}
          iconColor={iconColor}
          postId={post.id}
          initialLiked={post.likedByMe}
        />
        <View className="flex-row items-center gap-1">
          <SMSIcon width={ICON_SIZE} height={ICON_SIZE} color={iconColor} />
          <Text className="text-body-sm">{post.commentCount}</Text>
        </View>
      </View>
    </View>
  );
}
