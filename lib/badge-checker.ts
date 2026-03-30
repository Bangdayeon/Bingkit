import { supabase } from '@/lib/supabase';

export const BADGE_META: Record<string, { name: string; message: string }> = {
  cell_1: { name: '첫 발걸음', message: '빙고 칸 10개를 달성했어요! 🎉' },
  cell_2: { name: '꾸준한 도전', message: '빙고 칸 30개를 달성했어요! 🎉' },
  cell_3: { name: '목표 달성자', message: '빙고 칸 50개를 달성했어요! 🎉' },
  cell_4: { name: '빙고 마스터', message: '빙고 칸 100개를 달성했어요! 🏆' },
  like_1: { name: '첫 좋아요', message: '첫 좋아요를 눌렀어요! 💙' },
  like_2: { name: '좋아요둥이', message: '좋아요 10개를 눌렀어요! 💙' },
  like_3: { name: '좋아요 부스트', message: '좋아요 50개를 눌렀어요! ❤️' },
  like_4: { name: '좋아요 대마왕', message: '좋아요 100개를 눌렀어요! ❤️' },
  comment_1: { name: '첫 댓글', message: '첫 댓글을 작성했어요! 💬' },
  comment_2: { name: '이야기꾼', message: '댓글 30개를 작성했어요! 💬' },
  comment_3: { name: '소통왕', message: '댓글 50개를 작성했어요! 👑' },
  comment_4: { name: '댓글 마스터', message: '댓글 100개를 작성했어요! 👑' },
  post_1: { name: '첫 게시글', message: '첫 게시글을 작성했어요! 📝' },
  post_2: { name: '활발한 활동가', message: '게시글 30개를 작성했어요! 📝' },
  post_3: { name: '커뮤니티 스타', message: '게시글 50개를 작성했어요! ⭐' },
  post_4: { name: '전설의 작가', message: '게시글 80개를 작성했어요! 🏆' },
};

export type BadgeType = 'cell' | 'like' | 'comment' | 'post';

async function getCount(userId: string, type: BadgeType): Promise<number> {
  if (type === 'cell') {
    const { data } = await supabase
      .from('user_stats')
      .select('total_cell_checks')
      .eq('user_id', userId)
      .single();
    return (data?.total_cell_checks as number | undefined) ?? 0;
  }
  if (type === 'like') {
    const { count } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
    return count ?? 0;
  }
  if (type === 'comment') {
    const { count } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_deleted', false);
    return count ?? 0;
  }
  const { count } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_deleted', false);
  return count ?? 0;
}

export const checkAndAwardBadges = async (type: BadgeType, knownCount?: number): Promise<void> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: badges } = await supabase
    .from('badges')
    .select('id, name, icon_url, threshold')
    .eq('category', type)
    .order('threshold', { ascending: true });

  if (!badges || badges.length === 0) return;

  const { data: earned } = await supabase
    .from('user_badges')
    .select('badge_id')
    .eq('user_id', user.id)
    .in(
      'badge_id',
      badges.map((b) => b.id as string),
    );

  const earnedIds = new Set((earned ?? []).map((e) => e.badge_id as string));
  const count = knownCount ?? (await getCount(user.id, type));

  const toAward = badges.filter(
    (b) => (b.threshold as number) <= count && !earnedIds.has(b.id as string),
  );

  if (toAward.length === 0) return;

  // 뱃지 수여
  await supabase
    .from('user_badges')
    .insert(toAward.map((b) => ({ user_id: user.id, badge_id: b.id })));

  // 가장 높은 뱃지 1개만 알림 처리
  const topBadge = toAward[toAward.length - 1];
  const meta = BADGE_META[topBadge.name as string];
  if (!meta) return;

  const notificationMessage = `🏅 새 뱃지 획득! ${meta.name} - ${meta.message}`;

  // 앱 내 알림 저장 + 푸시 토큰 조회 병렬 처리
  const [, tokenResult] = await Promise.all([
    supabase.from('notifications').insert({
      user_id: user.id,
      type: 'badge',
      message: notificationMessage,
      target_id: topBadge.id,
      target_type: 'badge',
    }),
    supabase.from('push_tokens').select('token').eq('user_id', user.id).single(),
  ]);

  // 푸시 알림 전송
  const token = tokenResult.data?.token as string | undefined;
  if (!token) return;

  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      to: token,
      title: '🏅 새 뱃지 획득!',
      body: `${meta.name} - ${meta.message}`,
      sound: 'default',
      data: { type: 'badge', badgeId: topBadge.id as string },
    }),
  });
};
