-- 게시글 작성자는 본인 글을 삭제 여부와 관계없이 조회 가능
-- (PostgREST가 UPDATE 후 SELECT 정책을 재검증할 때 소프트 딜리트가 막히는 문제 해결)
create policy "posts: 본인 글 항상 조회 가능" on public.posts
  for select using (auth.uid() = user_id);
