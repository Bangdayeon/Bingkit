import { Dimensions, Image, ScrollView, View } from 'react-native';
import { Text } from '@/components/Text';
import SMSIcon from '@/assets/icons/ic_sms.svg';
import { LikeButton } from './LikeButton';
import { AnonymousProfile } from '@/components/AnonymousProfile';
import { ProfileAvatar } from '@/components/ProfileAvatar';
import { CommunityPost } from '@/types/community';
import { getThemeImage, FIGMA_W, FIGMA_H, GRID_CONFIGS } from '@/features/bingo/lib/theme-config';

const ICON_SIZE = 20;

function BingoBoardPreview({
  cells,
  grid,
  theme,
}: {
  cells: string[];
  grid: string;
  theme: string;
}) {
  const [cols, rows] = grid.split('x').map(Number);
  const availableWidth = Dimensions.get('window').width - 40;
  const image = getThemeImage(theme as never, grid);

  if (image !== null) {
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
          source={image}
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
                style={{ color: '#181C1C' /* gray-900 */ }}
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

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 12 }}>
      {cells.map((text, i) => (
        <View
          key={i}
          style={{
            width: '31.3%',
            height: 72,
            borderRadius: 4,
            borderWidth: 1,
            borderColor: '#D2D6D6' /* gray-300 */,
            backgroundColor: '#FDFDFD' /* white */,
            alignItems: 'center',
            justifyContent: 'center',
            padding: 4,
          }}
        >
          <Text className="text-body-sm text-center" numberOfLines={2}>
            {text}
          </Text>
        </View>
      ))}
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
      {/* 작성자 정보 */}
      <View className="flex-row items-center gap-2">
        {post.isAnonymous ? (
          <AnonymousProfile seed={post.id} size="md" />
        ) : (
          <ProfileAvatar avatarUrl={post.avatarUrl ?? null} size={32} />
        )}
        <Text className="text-label-sm">{post.author}</Text>
        <Text className="text-caption-sm" style={{ color: '#181C1C' /* gray-900 */ }}>
          •
        </Text>
        <Text className="text-caption-sm" style={{ color: '#929898' /* gray-500 */ }}>
          {post.timeAgo}
        </Text>
      </View>

      {/* 제목 */}
      <Text className="text-title-md mt-3">{post.title}</Text>

      {/* 빙고판 (테마 이미지 포함) */}
      {post.bingo && (
        <BingoBoardPreview
          cells={post.bingo.cells}
          grid={post.bingo.grid}
          theme={post.bingo.theme}
        />
      )}

      {/* 업로드 이미지 (빙고 없을 때) */}
      {!post.bingo && post.imageUrls && post.imageUrls.length > 0 && (
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
      )}

      {/* 본문 */}
      <Text className="text-body-sm mt-3">{post.body}</Text>

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
