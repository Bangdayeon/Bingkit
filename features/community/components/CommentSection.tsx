import { View } from 'react-native';
import { Text } from '@/components/Text';
import SMSIcon from '@/assets/icons/ic_sms.svg';
import { CommentItem } from './CommentItem';
import { Comment } from '@/types/community';

interface CommentSectionProps {
  comments: Comment[];
  iconColor: string;
  onMenuPress: (id: string, pageY: number) => void;
  onReplyPress: (id: string, author: string) => void;
}

export function CommentSection({
  comments,
  iconColor,
  onMenuPress,
  onReplyPress,
}: CommentSectionProps) {
  return (
    <View className="px-5 pt-4 pb-4">
      <Text className="text-title-sm mb-3">댓글 {comments.length}</Text>

      {comments.length === 0 ? (
        <View className="items-center py-12 gap-3">
          <View style={{ width: 60, height: 60, opacity: 0.25 }}>
            <SMSIcon width={60} height={60} color={iconColor} />
          </View>
          <Text className="text-body-md" style={{ color: '#929898' /* gray-500 */ }}>
            첫 댓글을 남겨주세요.
          </Text>
        </View>
      ) : (
        <View className="gap-8">
          {comments.map((c) => (
            <CommentItem
              key={c.id}
              comment={c}
              iconColor={iconColor}
              onMenuPress={onMenuPress}
              onReplyPress={onReplyPress}
            />
          ))}
        </View>
      )}
    </View>
  );
}
