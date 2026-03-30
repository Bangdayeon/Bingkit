create table public.comment_likes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users(id) on delete cascade,
  comment_id  uuid not null references public.comments(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (user_id, comment_id)
);

alter table public.comment_likes enable row level security;

create policy "comment_likes: 전체 조회" on public.comment_likes
  for select using (true);

create policy "comment_likes: 본인 작성" on public.comment_likes
  for insert with check (auth.uid() = user_id);

create policy "comment_likes: 본인 삭제" on public.comment_likes
  for delete using (auth.uid() = user_id);