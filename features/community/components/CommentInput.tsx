import { useEffect, useRef } from 'react';
import { Pressable, TextInput as RNTextInput, View } from 'react-native';
import { Text } from '@/components/Text';
import { AnonymousProfile } from '@/components/AnonymousProfile';
import SendIcon from '@/assets/icons/ic_send.svg';

interface CommentInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  isDark: boolean;
  paddingBottom: number;
  replyTo: { id: string; author: string } | null;
  onCancelReply: () => void;
}

export function CommentInput({
  value,
  onChangeText,
  onSubmit,
  isDark,
  paddingBottom,
  replyTo,
  onCancelReply,
}: CommentInputProps) {
  const inputRef = useRef<RNTextInput>(null);

  useEffect(() => {
    if (replyTo) inputRef.current?.focus();
  }, [replyTo?.id]);

  return (
    <View
      className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
      style={{ paddingBottom }}
    >
      {replyTo && (
        <View
          className="flex-row items-center justify-between px-5 py-2"
          style={{ backgroundColor: '#E8FAFE' /* sky-100 */ }}
        >
          <Text className="text-caption-sm" style={{ color: '#929898' /* gray-500 */ }}>
            {replyTo.author}에게 답글 작성 중
          </Text>
          <Pressable hitSlop={8} onPress={onCancelReply}>
            <Text style={{ color: '#929898' /* gray-500 */, fontSize: 16, lineHeight: 18 }}>×</Text>
          </Pressable>
        </View>
      )}

      <View className="flex-row items-center px-5 gap-3" style={{ paddingTop: 8 }}>
        <AnonymousProfile seed="me" size="sm" />
        {/* TODO: auth 연동 후 실제 userId로 교체 */}
        <View
          className="flex-1 flex-row items-center rounded-full px-4"
          style={{ height: 40, backgroundColor: '#E8FAFE' /* sky-100 */ }}
        >
          <RNTextInput
            ref={inputRef}
            value={value}
            onChangeText={onChangeText}
            placeholder={replyTo ? `${replyTo.author}에게 답글...` : '댓글을 입력해주세요.'}
            placeholderTextColor="#929898" /* gray-500 */
            style={{
              flex: 1,
              fontSize: 14,
              lineHeight: 18,
              color: isDark ? '#F6F7F7' : '#181C1C' /* gray-100 : gray-900 */,
            }}
          />
          <Pressable hitSlop={8} onPress={onSubmit}>
            {({ pressed }) => (
              <SendIcon
                width={24}
                height={24}
                color={pressed ? '#F79A6E' /* peach400 */ : '#F07840' /* peach500 */}
              />
            )}
          </Pressable>
        </View>
      </View>
    </View>
  );
}
