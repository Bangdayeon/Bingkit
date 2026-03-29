import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
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
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Text } from '@/components/Text';
import ArrowBackIcon from '@/assets/icons/ic_arrow_back.svg';
import { Popover } from '@/components/Popover';
import { PostHeader, HEADER_H } from '@/features/community/components/PostHeader';
import { PostBody } from '@/features/community/components/PostBody';
import { CommentSection } from '@/features/community/components/CommentSection';
import { CommentInput } from '@/features/community/components/CommentInput';
import { Comment, CommunityPost } from '@/types/community';
import {
  fetchPost,
  deletePost,
  fetchComments,
  addComment,
  deleteComment,
  submitReport,
  blockUser,
} from '@/features/community/lib/community';
import { checkAndAwardBadges } from '@/lib/badge-checker';
import { supabase } from '@/lib/supabase';

const REPORT_REASONS = [
  '상업적 광고 및 판매',
  '욕설/비하',
  '음란물/성적인 내용',
  '도배',
  '사칭/사기',
  '기타',
];

const MODAL_CARD_STYLE = {
  backgroundColor: '#FDFDFD' as const,
  borderRadius: 30,
  paddingHorizontal: 20,
  paddingTop: 24,
  paddingBottom: 20,
  width: '100%' as const,
  maxWidth: 300,
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.15,
  shadowRadius: 5,
  elevation: 5,
};

const MODAL_OVERLAY_STYLE = {
  flex: 1 as const,
  backgroundColor: 'rgba(0,0,0,0.4)',
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
  paddingHorizontal: 20,
};

export default function CommunityDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === 'dark';
  const iconColor = isDark ? '#F6F7F7' /* gray-100 */ : '#4C5252'; /* gray-700 */

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [post, setPost] = useState<CommunityPost | null>(null);
  const [postLoading, setPostLoading] = useState(true);
  const [localComments, setLocalComments] = useState<Comment[]>([]);
  const [, setCommentsLoading] = useState(false);
  const [comment, setComment] = useState('');
  const [commentAnonymous, setCommentAnonymous] = useState(false);
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  const [keyboardShown, setKeyboardShown] = useState(false);

  // ── 모달 상태 ──────────────────────────────────────────────
  const [alertModal, setAlertModal] = useState<{ title: string; message: string } | null>(null);

  const [showPostMenu, setShowPostMenu] = useState(false);
  const [commentMenuId, setCommentMenuId] = useState<string | null>(null);
  const [commentMenuTop, setCommentMenuTop] = useState(0);

  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [reportTarget, setReportTarget] = useState<{ type: 'post' | 'comment'; id: string } | null>(
    null,
  );
  const [isReporting, setIsReporting] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [showDeleteCommentModal, setShowDeleteCommentModal] = useState(false);
  const [deleteCommentTargetId, setDeleteCommentTargetId] = useState<string | null>(null);
  const [isDeletingComment, setIsDeletingComment] = useState(false);

  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockTargetUserId, setBlockTargetUserId] = useState<string | null>(null);
  const [isBlocking, setIsBlocking] = useState(false);

  const [replyTo, setReplyTo] = useState<{ id: string; author: string } | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id ?? null);
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!id) return;
      setPostLoading(true);
      fetchPost(id).then((data) => {
        setPost(data);
        setPostLoading(false);
      });
    }, [id]),
  );

  useEffect(() => {
    if (!id) return;
    setCommentsLoading(true);
    fetchComments(id).then((data) => {
      setLocalComments(data);
      setCommentsLoading(false);
    });
  }, [id]);

  const refreshComments = useCallback(async () => {
    if (!id) return;
    const data = await fetchComments(id);
    setLocalComments(data);
  }, [id]);

  useEffect(() => {
    const show = Keyboard.addListener('keyboardWillShow', () => setKeyboardShown(true));
    const hide = Keyboard.addListener('keyboardWillHide', () => setKeyboardShown(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  if (postLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-900" edges={['top']}>
        <View
          className="flex-row items-center border-b border-gray-300 dark:border-gray-700"
          style={{ height: 60 }}
        >
          <View style={{ width: 56 }} className="pl-4">
            <Pressable onPress={() => router.back()} hitSlop={8}>
              <ArrowBackIcon width={20} height={20} color={iconColor} />
            </Pressable>
          </View>
        </View>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#929898" />
        </View>
      </SafeAreaView>
    );
  }

  if (!post) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-900" edges={['top']}>
        <View
          className="flex-row items-center border-b border-gray-300 dark:border-gray-700"
          style={{ height: 60 }}
        >
          <View style={{ width: 56 }} className="pl-4">
            <Pressable onPress={() => router.back()} hitSlop={8}>
              <ArrowBackIcon width={20} height={20} color={iconColor} />
            </Pressable>
          </View>
        </View>
        <View className="flex-1 items-center justify-center">
          <Text className="text-body-lg" style={{ color: '#929898' /* gray-500 */ }}>
            게시글을 찾을 수 없습니다.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const isOwnPost = post.userId === currentUserId;

  // ── 핸들러 ─────────────────────────────────────────────────

  const handleDeletePost = async () => {
    setIsDeleting(true);
    try {
      await deletePost(post.id);
      setShowDeleteModal(false);
      router.back();
    } catch (e) {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setAlertModal({
        title: '삭제 실패',
        message: e instanceof Error ? e.message : '게시글 삭제에 실패했습니다.',
      });
    }
  };

  const handleAddComment = async () => {
    const trimmed = comment.trim();
    if (!trimmed || commentSubmitting) return;
    setCommentSubmitting(true);
    try {
      await addComment(post.id, trimmed, commentAnonymous, replyTo?.id);
      checkAndAwardBadges('comment');
      setComment('');
      setReplyTo(null);
      Keyboard.dismiss();
      await refreshComments();
    } catch (e) {
      setAlertModal({
        title: '오류',
        message: e instanceof Error ? e.message : '댓글 작성에 실패했습니다.',
      });
    } finally {
      setCommentSubmitting(false);
    }
  };

  const handleDeleteComment = (commentId: string) => {
    setCommentMenuId(null);
    setDeleteCommentTargetId(commentId);
    setShowDeleteCommentModal(true);
  };

  const confirmDeleteComment = async () => {
    if (!deleteCommentTargetId) return;
    setIsDeletingComment(true);
    try {
      await deleteComment(deleteCommentTargetId);
      setShowDeleteCommentModal(false);
      setDeleteCommentTargetId(null);
      await refreshComments();
    } catch (e) {
      setShowDeleteCommentModal(false);
      setDeleteCommentTargetId(null);
      setAlertModal({
        title: '오류',
        message: e instanceof Error ? e.message : '댓글 삭제에 실패했습니다.',
      });
    } finally {
      setIsDeletingComment(false);
    }
  };

  const handleBlockUser = (userId: string) => {
    setBlockTargetUserId(userId);
    setShowBlockModal(true);
  };

  const confirmBlockUser = async () => {
    if (!blockTargetUserId) return;
    setIsBlocking(true);
    try {
      await blockUser(blockTargetUserId);
      setShowBlockModal(false);
      setBlockTargetUserId(null);
      setAlertModal({ title: '차단 완료', message: '해당 사용자를 차단했습니다.' });
    } catch (e) {
      setShowBlockModal(false);
      setBlockTargetUserId(null);
      setAlertModal({
        title: '오류',
        message: e instanceof Error ? e.message : '차단에 실패했습니다.',
      });
    } finally {
      setIsBlocking(false);
    }
  };

  // ── 팝오버 메뉴 아이템 ─────────────────────────────────────

  const postMenuItems = isOwnPost
    ? [
        {
          label: '수정하기',
          onPress: () => {
            setShowPostMenu(false);
            router.push({
              pathname: '/community/write',
              params: {
                postId: post.id,
                initTitle: post.title,
                initContent: post.body,
                initCategory: post.category,
                initImageUrls: JSON.stringify(post.imageUrls ?? []),
                initIsAnonymous: post.isAnonymous ? '1' : '0',
              },
            });
          },
        },
        {
          label: '삭제하기',
          danger: true as const,
          onPress: () => {
            setShowPostMenu(false);
            setShowDeleteModal(true);
          },
        },
      ]
    : [
        {
          label: '신고하기',
          onPress: () => {
            setShowPostMenu(false);
            setReportTarget({ type: 'post', id: post.id });
            setShowReportModal(true);
          },
        },
        {
          label: '차단하기',
          danger: true as const,
          onPress: () => {
            setShowPostMenu(false);
            handleBlockUser(post.userId);
          },
        },
      ];

  const commentMenuUserId =
    localComments.find((c) => c.id === commentMenuId)?.userId ??
    localComments.flatMap((c) => c.replies ?? []).find((r) => r.id === commentMenuId)?.userId;

  const isOwnComment = commentMenuUserId === currentUserId;

  const commentMenuItems = isOwnComment
    ? [
        {
          label: '삭제하기',
          danger: true as const,
          onPress: () => commentMenuId && handleDeleteComment(commentMenuId),
        },
      ]
    : [
        {
          label: '신고하기',
          onPress: () => {
            if (commentMenuId) setReportTarget({ type: 'comment', id: commentMenuId });
            setCommentMenuId(null);
            setShowReportModal(true);
          },
        },
        {
          label: '차단하기',
          danger: true as const,
          onPress: () => {
            const uid = commentMenuUserId;
            setCommentMenuId(null);
            if (uid) handleBlockUser(uid);
          },
        },
      ];

  const handleCommentMenuPress = (commentId: string, pageY: number) => {
    setCommentMenuTop(pageY - insets.top + 8);
    setCommentMenuId(commentId);
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900" edges={['top']}>
      <PostHeader
        type={post.category}
        iconColor={iconColor}
        onBack={() => router.back()}
        onMenuPress={() => setShowPostMenu((v) => !v)}
      />

      <Popover
        visible={showPostMenu}
        items={postMenuItems}
        onDismiss={() => setShowPostMenu(false)}
        style={{ top: HEADER_H + 8, right: 16 }}
      />
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
            postAuthorId={post.userId}
            iconColor={iconColor}
            onMenuPress={handleCommentMenuPress}
            onReplyPress={(replyId, author) => setReplyTo({ id: replyId, author })}
          />
        </ScrollView>

        <CommentInput
          value={comment}
          onChangeText={setComment}
          onSubmit={handleAddComment}
          paddingBottom={keyboardShown ? 8 : insets.bottom + 8}
          replyTo={replyTo}
          onCancelReply={() => setReplyTo(null)}
          isAnonymous={commentAnonymous}
          onToggleAnonymous={() => setCommentAnonymous((v) => !v)}
          isSubmitting={commentSubmitting}
        />
      </KeyboardAvoidingView>

      {/* ── 신고하기 모달 ── */}
      <Modal
        visible={showReportModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowReportModal(false)}
      >
        <Pressable
          style={MODAL_OVERLAY_STYLE}
          onPress={() => !isReporting && setShowReportModal(false)}
        >
          <Pressable style={MODAL_CARD_STYLE}>
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
                onPress={() => {
                  setShowReportModal(false);
                  setSelectedReason(null);
                  setReportTarget(null);
                }}
                disabled={isReporting}
                className="flex-1 h-9 rounded-full border border-gray-300 items-center justify-center"
              >
                <Text className="text-label-sm">취소하기</Text>
              </Pressable>
              <Pressable
                onPress={async () => {
                  if (!selectedReason || !reportTarget) return;
                  setIsReporting(true);
                  try {
                    await submitReport(reportTarget.type, reportTarget.id, selectedReason);
                    setShowReportModal(false);
                    setSelectedReason(null);
                    setReportTarget(null);
                    setAlertModal({ title: '신고 완료', message: '신고가 접수되었습니다.' });
                  } catch (e) {
                    setAlertModal({
                      title: '오류',
                      message: e instanceof Error ? e.message : '신고에 실패했습니다.',
                    });
                  } finally {
                    setIsReporting(false);
                  }
                }}
                disabled={!selectedReason || isReporting}
                style={{
                  flex: 1,
                  height: 36,
                  borderRadius: 999,
                  backgroundColor: '#EC5858' /* red-400 */,
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: selectedReason && !isReporting ? 1 : 0.5,
                }}
              >
                {isReporting ? (
                  <ActivityIndicator size="small" color="#FDFDFD" />
                ) : (
                  <Text className="text-label-sm" style={{ color: '#FDFDFD' }}>
                    신고하기
                  </Text>
                )}
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── 게시글 삭제 확인 모달 ── */}
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => !isDeleting && setShowDeleteModal(false)}
      >
        <Pressable
          style={MODAL_OVERLAY_STYLE}
          onPress={() => !isDeleting && setShowDeleteModal(false)}
        >
          <Pressable style={MODAL_CARD_STYLE}>
            <Text className="text-title-sm mb-2">게시글 삭제</Text>
            <Text className="text-body-sm text-gray-500">
              정말로 삭제하시겠어요?{'\n'}삭제된 게시글은 복구할 수 없어요.
            </Text>
            <View className="flex-row gap-3 mt-5">
              <Pressable
                onPress={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="flex-1 h-9 rounded-full border border-gray-300 items-center justify-center"
              >
                <Text className="text-label-sm">취소</Text>
              </Pressable>
              <Pressable
                onPress={handleDeletePost}
                disabled={isDeleting}
                style={{
                  flex: 1,
                  height: 36,
                  borderRadius: 999,
                  backgroundColor: '#EC5858' /* red-400 */,
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: isDeleting ? 0.5 : 1,
                }}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color="#FDFDFD" />
                ) : (
                  <Text className="text-label-sm" style={{ color: '#FDFDFD' }}>
                    삭제하기
                  </Text>
                )}
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── 댓글 삭제 확인 모달 ── */}
      <Modal
        visible={showDeleteCommentModal}
        transparent
        animationType="fade"
        onRequestClose={() => !isDeletingComment && setShowDeleteCommentModal(false)}
      >
        <Pressable
          style={MODAL_OVERLAY_STYLE}
          onPress={() => !isDeletingComment && setShowDeleteCommentModal(false)}
        >
          <Pressable style={MODAL_CARD_STYLE}>
            <Text className="text-title-sm mb-2">댓글 삭제</Text>
            <Text className="text-body-sm text-gray-500">댓글을 삭제할까요?</Text>
            <View className="flex-row gap-3 mt-5">
              <Pressable
                onPress={() => {
                  setShowDeleteCommentModal(false);
                  setDeleteCommentTargetId(null);
                }}
                disabled={isDeletingComment}
                className="flex-1 h-9 rounded-full border border-gray-300 items-center justify-center"
              >
                <Text className="text-label-sm">취소</Text>
              </Pressable>
              <Pressable
                onPress={confirmDeleteComment}
                disabled={isDeletingComment}
                style={{
                  flex: 1,
                  height: 36,
                  borderRadius: 999,
                  backgroundColor: '#EC5858' /* red-400 */,
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: isDeletingComment ? 0.5 : 1,
                }}
              >
                {isDeletingComment ? (
                  <ActivityIndicator size="small" color="#FDFDFD" />
                ) : (
                  <Text className="text-label-sm" style={{ color: '#FDFDFD' }}>
                    삭제하기
                  </Text>
                )}
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── 차단 확인 모달 ── */}
      <Modal
        visible={showBlockModal}
        transparent
        animationType="fade"
        onRequestClose={() => !isBlocking && setShowBlockModal(false)}
      >
        <Pressable
          style={MODAL_OVERLAY_STYLE}
          onPress={() => !isBlocking && setShowBlockModal(false)}
        >
          <Pressable style={MODAL_CARD_STYLE}>
            <Text className="text-title-sm mb-2">차단하기</Text>
            <Text className="text-body-sm text-gray-500">
              이 사용자를 차단하시겠어요?{'\n'}차단된 사용자의 게시글과 댓글이 보이지 않습니다.
            </Text>
            <View className="flex-row gap-3 mt-5">
              <Pressable
                onPress={() => {
                  setShowBlockModal(false);
                  setBlockTargetUserId(null);
                }}
                disabled={isBlocking}
                className="flex-1 h-9 rounded-full border border-gray-300 items-center justify-center"
              >
                <Text className="text-label-sm">취소</Text>
              </Pressable>
              <Pressable
                onPress={confirmBlockUser}
                disabled={isBlocking}
                style={{
                  flex: 1,
                  height: 36,
                  borderRadius: 999,
                  backgroundColor: '#EC5858' /* red-400 */,
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: isBlocking ? 0.5 : 1,
                }}
              >
                {isBlocking ? (
                  <ActivityIndicator size="small" color="#FDFDFD" />
                ) : (
                  <Text className="text-label-sm" style={{ color: '#FDFDFD' }}>
                    차단하기
                  </Text>
                )}
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── 범용 알림 모달 ── */}
      <Modal
        visible={alertModal !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setAlertModal(null)}
      >
        <Pressable style={MODAL_OVERLAY_STYLE} onPress={() => setAlertModal(null)}>
          <Pressable style={MODAL_CARD_STYLE}>
            <Text className="text-title-sm mb-2">{alertModal?.title}</Text>
            <Text className="text-body-sm text-gray-500">{alertModal?.message}</Text>
            <View className="mt-5">
              <Pressable
                onPress={() => setAlertModal(null)}
                className="h-9 rounded-full items-center justify-center"
                style={{ backgroundColor: '#28C8DE' /* sky-500 */ }}
              >
                <Text className="text-label-sm" style={{ color: '#FDFDFD' }}>
                  확인
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
