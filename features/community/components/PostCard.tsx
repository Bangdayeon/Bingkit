import { useEffect, useState } from 'react';
import { Dimensions, Image, View, useColorScheme } from 'react-native';
import { Text } from '@/components/Text';
import SMSIcon from '@/assets/icons/ic_sms.svg';
import { CommunityPost } from '@/types/community';
import { LikeButton } from './LikeButton';
import { AnonymousProfile } from '@/components/AnonymousProfile';
import { ProfileAvatar } from '@/components/ProfileAvatar';
import { getThemeImageUrl, FIGMA_W, FIGMA_H, GRID_CONFIGS } from '@/features/bingo/lib/theme';
import { GridType } from '@/types/bingo-cell';

const ICON_SIZE = 20;

function BingoBoardPreview({
  cells,
  grid,
  theme,
}: {
  cells: string[];
  grid: GridType;
  theme: string;
}) {
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

  const [cols, rows] = grid.split('x').map(Number);
  const availableWidth = Dimensions.get('window').width - 40;

  if (imageUri) {
    const scale = availableWidth / FIGMA_W;
    const cardHeight = FIGMA_H * scale;
    const cfg = GRID_CONFIGS[grid];
    if (!cfg) return null;
    const gridTop = cfg.top * scale;
    const gridLeft = cfg.left * scale;
    const cellW = cfg.cellW * scale;
    const cellH = cfg.cellH * scale;
    const gapX = cfg.gapX * scale;
    const gapY = cfg.gapY * scale;

    return (
      <View style={{ width: availableWidth, height: cardHeight, marginTop: 12 }}>
        <Image
          source={{ uri: imageUri }}
          style={{ position: 'absolute', width: '100%', height: '100%' }}
          resizeMode="cover"
        />
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

  // 이미지 없으면 기본 그리드 렌더링
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
      {cells.map((text, i) => (
        <View
          key={i}
          style={{
            width: `${(100 - (cols - 1) * 2) / cols}%` as unknown as number,
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
    </View>
  );
}

interface PostCardProps {
  post: CommunityPost;
}

export function PostCard({ post }: PostCardProps) {
  const isDark = useColorScheme() === 'dark';
  const iconColor = isDark ? '#F6F7F7' : '#4C5252';

  return (
    <View className="px-5 pt-4 pb-4">
      {/* 작성자 */}
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

      {/* 제목 */}
      <Text className="text-label-sm mt-2">{post.title}</Text>

      {/* 빙고판 / 이미지 */}
      {post.bingo ? (
        <BingoBoardPreview
          cells={post.bingo.cells}
          grid={post.bingo.grid as GridType}
          theme={post.bingo.theme}
        />
      ) : post.imageUrls?.length ? (
        <Image
          source={{ uri: post.imageUrls[0] }}
          style={{ width: '100%', height: 180, borderRadius: 8, marginTop: 12 }}
          resizeMode="cover"
        />
      ) : null}

      {/* 좋아요 / 댓글 */}
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
