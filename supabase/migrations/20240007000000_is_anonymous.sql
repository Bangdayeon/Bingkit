-- 게시글/댓글 익명 여부 컬럼 추가
alter table public.posts
  add column if not exists is_anonymous boolean not null default false;

alter table public.comments
  add column if not exists is_anonymous boolean not null default false;

comment on column public.posts.is_anonymous    is '익명 게시글 여부. true이면 작성자를 ''익명''으로 표시';
comment on column public.comments.is_anonymous is '익명 댓글 여부. true이면 작성자를 ''익명''으로 표시';
