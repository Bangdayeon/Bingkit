-- badges 테이블에 (category, threshold) unique constraint 추가
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'badges_category_threshold_unique'
  ) then
    alter table public.badges
      add constraint badges_category_threshold_unique unique (category, threshold);
  end if;
end $$;

-- RLS 활성화 (조회는 누구나, 수정은 불가)
alter table public.badges enable row level security;
drop policy if exists "badges: 누구나 조회" on public.badges;
create policy "badges: 누구나 조회" on public.badges
  for select using (true);

alter table public.user_badges enable row level security;
drop policy if exists "user_badges: 본인만" on public.user_badges;
create policy "user_badges: 본인만" on public.user_badges
  for all using (auth.uid() = user_id);

-- 뱃지 시드 데이터 (이미지는 R2 버킷 /badges/ 경로)
insert into public.badges (category, name, icon_url, threshold) values
  -- 빙고 칸 달성 (is_checked = true 누적)
  ('cell', 'cell_1', 'https://pub-ce1a524f861f4062a6ec96dd100c4aec.r2.dev/badges/cell_1.png', 10),
  ('cell', 'cell_2', 'https://pub-ce1a524f861f4062a6ec96dd100c4aec.r2.dev/badges/cell_2.png', 30),
  ('cell', 'cell_3', 'https://pub-ce1a524f861f4062a6ec96dd100c4aec.r2.dev/badges/cell_3.png', 50),
  ('cell', 'cell_4', 'https://pub-ce1a524f861f4062a6ec96dd100c4aec.r2.dev/badges/cell_4.png', 100),
  -- 좋아요 누른 횟수
  ('like', 'like_1', 'https://pub-ce1a524f861f4062a6ec96dd100c4aec.r2.dev/badges/like_1.png', 1),
  ('like', 'like_2', 'https://pub-ce1a524f861f4062a6ec96dd100c4aec.r2.dev/badges/like_2.png', 10),
  ('like', 'like_3', 'https://pub-ce1a524f861f4062a6ec96dd100c4aec.r2.dev/badges/like_3.png', 50),
  ('like', 'like_4', 'https://pub-ce1a524f861f4062a6ec96dd100c4aec.r2.dev/badges/like_4.png', 100),
  -- 댓글/대댓글 작성 횟수
  ('comment', 'comment_1', 'https://pub-ce1a524f861f4062a6ec96dd100c4aec.r2.dev/badges/comment_1.png', 10),
  ('comment', 'comment_2', 'https://pub-ce1a524f861f4062a6ec96dd100c4aec.r2.dev/badges/comment_2.png', 30),
  ('comment', 'comment_3', 'https://pub-ce1a524f861f4062a6ec96dd100c4aec.r2.dev/badges/comment_3.png', 50),
  ('comment', 'comment_4', 'https://pub-ce1a524f861f4062a6ec96dd100c4aec.r2.dev/badges/comment_4.png', 100),
  -- 게시글 작성 횟수
  ('post', 'post_1', 'https://pub-ce1a524f861f4062a6ec96dd100c4aec.r2.dev/badges/post_1.png', 10),
  ('post', 'post_2', 'https://pub-ce1a524f861f4062a6ec96dd100c4aec.r2.dev/badges/post_2.png', 30),
  ('post', 'post_3', 'https://pub-ce1a524f861f4062a6ec96dd100c4aec.r2.dev/badges/post_3.png', 50),
  ('post', 'post_4', 'https://pub-ce1a524f861f4062a6ec96dd100c4aec.r2.dev/badges/post_4.png', 80)
on conflict (category, threshold) do nothing;
