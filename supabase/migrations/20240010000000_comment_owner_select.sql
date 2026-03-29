-- 댓글 작성자는 본인 댓글을 삭제 여부와 관계없이 조회 가능
-- (PostgREST가 UPDATE 후 SELECT 정책을 재검증할 때 소프트 딜리트가 막히는 문제 해결)
drop policy if exists "comments: 본인 댓글 항상 조회 가능" on public.comments;
create policy "comments: 본인 댓글 항상 조회 가능" on public.comments
  for select using (auth.uid() = user_id);
