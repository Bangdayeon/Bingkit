import { Pressable, View } from 'react-native';
import { Text } from '@/components/Text';
import MoreVertIcon from '@/assets/icons/ic_more_vert.svg';
import SMSIcon from '@/assets/icons/ic_sms.svg';
import { LikeButton } from './LikeButton';
import { AnonymousProfile } from '@/components/AnonymousProfile';
import { ReplyItem } from './ReplyItem';
import { Comment } from '@/types/community';

interface CommentItemProps {
  comment: Comment;
  iconColor: string;
  onMenuPress: (id: string, pageY: number) => void;
  onReplyPress: (id: string, author: string) => void;
}

export function CommentItem({ comment, iconColor, onMenuPress, onReplyPress }: CommentItemProps) {
  return (
    <View>
      <View className="flex-row items-center">
        <AnonymousProfile seed={comment.author} size="sm" />
        <Text className="text-label-sm ml-2">{comment.author}</Text>
        <View style={{ flex: 1 }} />
        <View className="flex-row items-center gap-3">
          <LikeButton size="sm" count={comment.likeCount} iconColor={iconColor} />
          <Pressable hitSlop={8} onPress={() => onReplyPress(comment.id, comment.author)}>
            <SMSIcon width={18} height={18} color={iconColor} />
          </Pressable>
          <Pressable hitSlop={8} onPress={(e) => onMenuPress(comment.id, e.nativeEvent.pageY)}>
            <MoreVertIcon width={18} height={18} color={iconColor} />
          </Pressable>
        </View>
      </View>
      <Text className="text-body-sm mt-1">{comment.body}</Text>
      <Text className="text-caption-sm mt-1 text-right" style={{ color: '#929898' /* gray-500 */ }}>
        {comment.createdAt}
      </Text>

      {comment.replies?.map((r) => (
        <ReplyItem key={r.id} reply={r} iconColor={iconColor} onMenuPress={onMenuPress} />
      ))}
    </View>
  );
}
