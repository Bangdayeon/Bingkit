import { supabase } from '@/lib/supabase';
import { badgeEvent } from '@/lib/badge-event';

// ── 뱃지 한글 메타데이터 ─────────────────────────────────────
const BADGE_META: Record<string, { name: string; message: string }> = {
  cell_1: { name: '첫 발걸음', message: '빙고 칸 10개를 달성했어요! 🎉' },
  cell_2: { name: '꾸준한 도전', message: '빙고 칸 30개를 달성했어요! 🎉' },
  cell_3: { name: '목표 달성자', message: '빙고 칸 50개를 달성했어요! 🎉' },
  cell_4: { name: '빙고 마스터', message: '빙고 칸 100개를 달성했어요! 🏆' },
  like_1: { name: '응원 시작', message: '처음 좋아요를 눌렀어요! 💙' },
  like_2: { name: '응원단', message: '좋아요 10개를 눌렀어요! 💙' },
  like_3: { name: '사랑을 나눠요', message: '좋아요 50개를 눌렀어요! ❤️' },
  like_4: { name: '좋아요 전도사', message: '좋아요 100개를 눌렀어요! ❤️' },
  comment_1: { name: '첫 댓글', message: '댓글 10개를 작성했어요! 💬' },
  comment_2: { name: '이야기꾼', message: '댓글 30개를 작성했어요! 💬' },
  comment_3: { name: '소통왕', message: '댓글 50개를 작성했어요! 👑' },
  comment_4: { name: '댓글 마스터', message: '댓글 100개를 작성했어요! 👑' },
  post_1: { name: '첫 게시글', message: '게시글 10개를 작성했어요! 📝' },
  post_2: { name: '활발한 활동가', message: '게시글 30개를 작성했어요! 📝' },
  post_3: { name: '커뮤니티 스타', message: '게시글 50개를 작성했어요! ⭐' },
  post_4: { name: '전설의 작가', message: '게시글 80개를 작성했어요! 🏆' },
};

export type BadgeType = 'cell' | 'like' | 'comment' | 'post';

// ── 타입별 현재 count 조회 ────────────────────────────────────
async function getCount(userId: string, type: BadgeType): Promise<number> {
  if (type === 'cell') {
    // user_stats에서 누적 카운트 조회 (취소/재체크 중복 방지됨)
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

  // post
  const { count } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_deleted', false);
  return count ?? 0;
}

// ── 뱃지 체크 & 수여 ─────────────────────────────────────────
export const checkAndAwardBadges = async (type: BadgeType): Promise<void> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  // 해당 카테고리 뱃지 목록
  const { data: badges } = await supabase
    .from('badges')
    .select('id, name, icon_url, threshold')
    .eq('category', type)
    .order('threshold', { ascending: true });

  if (!badges || badges.length === 0) return;

  // 이미 획득한 뱃지 ID
  const { data: earned } = await supabase
    .from('user_badges')
    .select('badge_id')
    .eq('user_id', user.id)
    .in(
      'badge_id',
      badges.map((b) => b.id as string),
    );

  const earnedIds = new Set((earned ?? []).map((e) => e.badge_id as string));

  // 현재 달성 수치
  const count = await getCount(user.id, type);

  // 달성했지만 아직 수여받지 못한 뱃지 (threshold 오름차순)
  const toAward = badges.filter(
    (b) => (b.threshold as number) <= count && !earnedIds.has(b.id as string),
  );

  if (toAward.length === 0) return;

  // 한 번에 INSERT
  await supabase
    .from('user_badges')
    .insert(toAward.map((b) => ({ user_id: user.id, badge_id: b.id })));

  // 가장 높은 뱃지 1개만 축하 표시 (중복 팝업 방지)
  const topBadge = toAward[toAward.length - 1];
  const meta = BADGE_META[topBadge.name as string];
  if (meta && topBadge.icon_url) {
    badgeEvent.emit({
      key: topBadge.name as string,
      name: meta.name,
      iconUrl: topBadge.icon_url as string,
      message: meta.message,
    });
  }
};
