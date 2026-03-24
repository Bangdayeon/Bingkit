import { useEffect, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Text } from '@/components/Text';
import { Popover } from '@/components/Popover';
import { PostHeader, HEADER_H } from '@/features/community/components/PostHeader';
import { PostBody } from '@/features/community/components/PostBody';
import { CommentSection } from '@/features/community/components/CommentSection';
import { CommentInput } from '@/features/community/components/CommentInput';
import { MOCK_COMMUNITY_POSTS } from '@/mocks/community-posts';
import { MOCK_COMMENTS } from '@/mocks/comments';
import { Comment } from '@/types/community';

// TODO: auth 연동 후 실제 사용자로 교체
const CURRENT_USER = 'user1234';

const REPORT_REASONS = [
  '상업적 광고 및 판매',
  '욕설/비하',
  '음란물/성적인 내용',
  '도배',
  '사칭/사기',
  '기타',
];

export default function CommunityDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === 'dark';
  const iconColor = isDark ? '#F6F7F7' /* gray-100 */ : '#4C5252'; /* gray-700 */

  const post = MOCK_COMMUNITY_POSTS.find((p) => p.id === id);
  const [localComments, setLocalComments] = useState<Comment[]>(MOCK_COMMENTS[id ?? ''] ?? []);
  const [comment, setComment] = useState('');

  const [keyboardShown, setKeyboardShown] = useState(false);

  useEffect(() => {
    const show = Keyboard.addListener('keyboardWillShow', () => setKeyboardShown(true));
    const hide = Keyboard.addListener('keyboardWillHide', () => setKeyboardShown(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const [replyTo, setReplyTo] = useState<{ id: string; author: string } | null>(null);

  const [showPostMenu, setShowPostMenu] = useState(false);
  const [commentMenuId, setCommentMenuId] = useState<string | null>(null);
  const [commentMenuTop, setCommentMenuTop] = useState(0);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);

  if (!post) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-900 items-center justify-center">
        <Text className="text-body-lg text-gray-500">게시글을 찾을 수 없습니다.</Text>
      </SafeAreaView>
    );
  }

  const isOwnPost = post.author === CURRENT_USER;

  const postMenuItems = isOwnPost
    ? [
        { label: '수정하기', onPress: () => router.push('/community/write') },
        { label: '삭제하기', danger: true as const, onPress: () => {} },
      ]
    : [
        { label: '신고하기', onPress: () => setShowReportModal(true) },
        { label: '차단하기', danger: true as const, onPress: () => {} },
      ];

  const commentMenuAuthor =
    localComments.find((c) => c.id === commentMenuId)?.author ??
    localComments.flatMap((c) => c.replies ?? []).find((r) => r.id === commentMenuId)?.author;

  const commentMenuItems =
    commentMenuAuthor === CURRENT_USER
      ? [{ label: '삭제하기', danger: true as const, onPress: () => {} }]
      : [{ label: '신고하기', onPress: () => setShowReportModal(true) }];

  const handleCommentMenuPress = (commentId: string, pageY: number) => {
    setCommentMenuTop(pageY - insets.top + 8);
    setCommentMenuId(commentId);
  };

  const handleAddComment = () => {
    const trimmed = comment.trim();
    if (!trimmed) return;
    const now = new Date();
    const yy = String(now.getFullYear()).slice(2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    const newEntry = {
      id: `c_${Date.now()}`,
      author: CURRENT_USER,
      body: trimmed,
      createdAt: `${yy}/${mm}/${dd}  ${hh}:${min}`,
      likeCount: 0,
    };
    if (replyTo) {
      setLocalComments((prev) =>
        prev.map((c) =>
          c.id === replyTo.id ? { ...c, replies: [...(c.replies ?? []), newEntry] } : c,
        ),
      );
      setReplyTo(null);
    } else {
      setLocalComments((prev) => [...prev, newEntry]);
    }
    setComment('');
    Keyboard.dismiss();
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900" edges={['top']}>
      <PostHeader
        type={post.type}
        iconColor={iconColor}
        onBack={() => router.back()}
        onMenuPress={() => setShowPostMenu((v) => !v)}
      />

      {/* 게시글 팝오버 */}
      <Popover
        visible={showPostMenu}
        items={postMenuItems}
        onDismiss={() => setShowPostMenu(false)}
        style={{ top: HEADER_H + 8, right: 16 }}
      />
      {/* 댓글 팝오버 */}
      <Popover
        visible={commentMenuId !== null}
        items={commentMenuItems}
        onDismiss={() => setCommentMenuId(null)}
        style={{ top: commentMenuTop, right: 16 }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={0}
      >
        <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled">
          <PostBody post={post} iconColor={iconColor} />

          <View className="h-px bg-gray-300 dark:bg-gray-700 mt-4" />

          <CommentSection
            comments={localComments}
            iconColor={iconColor}
            onMenuPress={handleCommentMenuPress}
            onReplyPress={(id, author) => setReplyTo({ id, author })}
          />
        </ScrollView>

        <CommentInput
          value={comment}
          onChangeText={setComment}
          onSubmit={handleAddComment}
          isDark={isDark}
          paddingBottom={keyboardShown ? 8 : insets.bottom + 8}
          replyTo={replyTo}
          onCancelReply={() => setReplyTo(null)}
        />
      </KeyboardAvoidingView>

      {/* 신고하기 모달 */}
      <Modal
        visible={showReportModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowReportModal(false)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.4)',
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 20,
          }}
          onPress={() => setShowReportModal(false)}
        >
          <Pressable
            style={{
              backgroundColor: '#FDFDFD' /* white */,
              borderRadius: 30,
              paddingHorizontal: 20,
              paddingTop: 24,
              paddingBottom: 20,
              width: '100%',
              maxWidth: 300,
              shadowColor: '#000000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 5,
              elevation: 5,
            }}
          >
            <Text className="text-title-sm mb-4">신고하기</Text>

            {REPORT_REASONS.map((reason) => (
              <Pressable
                key={reason}
                onPress={() => setSelectedReason(reason)}
                className="flex-row items-center gap-3 py-2"
              >
                <View
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 8,
                    borderWidth: 1.5,
                    borderColor:
                      selectedReason === reason
                        ? '#28C8DE' /* sky-500 */
                        : '#D2D6D6' /* gray-300 */,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {selectedReason === reason && (
                    <View
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: '#28C8DE' /* sky-500 */,
                      }}
                    />
                  )}
                </View>
                <Text className="text-body-md">{reason}</Text>
              </Pressable>
            ))}

            <View className="flex-row gap-3 mt-5">
              <Pressable
                onPress={() => setShowReportModal(false)}
                style={{
                  flex: 1,
                  height: 36,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: '#D2D6D6' /* gray-300 */,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text className="text-label-sm">취소하기</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  // TODO: 신고 API 호출
                  setShowReportModal(false);
                  setSelectedReason(null);
                }}
                style={{
                  flex: 1,
                  height: 36,
                  borderRadius: 999,
                  backgroundColor: '#EC5858' /* red-400 */,
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: selectedReason ? 1 : 0.5,
                }}
                disabled={!selectedReason}
              >
                <Text className="text-label-sm" style={{ color: '#FDFDFD' /* white */ }}>
                  신고하기
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
