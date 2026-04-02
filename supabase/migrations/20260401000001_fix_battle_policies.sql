-- ============================================================
-- Fix 1: battles 삭제 정책 (참여자 누구나 종료 가능)
-- ============================================================
create policy "battles: 참여자만 삭제" on public.battles
  for delete using (
    auth.uid() = user1_id or auth.uid() = user2_id
  );

-- ============================================================
-- Fix 2: battle_requests 삭제 정책
--   - sender: 취소 (기존에 있을 수 있음, 없으면 추가)
--   - receiver: 거절된 요청 숨기기(삭제)
-- ============================================================
drop policy if exists "battle_requests: sender만 취소(삭제)" on public.battle_requests;

create policy "battle_requests: sender 취소 또는 receiver 거절된 요청 삭제" on public.battle_requests
  for delete using (
    auth.uid() = sender_id
    or (auth.uid() = receiver_id and status = 'rejected')
  );
