import { View } from 'react-native';
import { Text } from '@/components/Text';
import SMSIcon from '@/assets/icons/ic_sms.svg';
import { LikeButton } from './LikeButton';
import { Avatar } from './Avatar';
import { CommunityPost } from '@/types/community';

const ICON_SIZE = 20;

function BingoGrid({ items }: { items: string[][] }) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 12 }}>
      {items.flat().map((text, i) => (
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
        <Avatar />
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

      {/* 빙고 그리드 */}
      {post.bingoItems && <BingoGrid items={post.bingoItems} />}

      {/* 본문 */}
      <Text className="text-body-sm mt-3">{post.body}</Text>

      {/* 좋아요 / 댓글 */}
      <View className="flex-row items-center gap-4 mt-3">
        <LikeButton count={post.likeCount} iconColor={iconColor} />
        <View className="flex-row items-center gap-1">
          <SMSIcon width={ICON_SIZE} height={ICON_SIZE} color={iconColor} />
          <Text className="text-body-sm">{post.commentCount}</Text>
        </View>
      </View>
    </View>
  );
}
