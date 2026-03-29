-- posts 테이블에 다중 이미지 URL 배열 컬럼 추가 (최대 5개)
alter table public.posts
  add column if not exists image_urls text[] not null default '{}';

comment on column public.posts.image_urls is '첨부 이미지 URL 목록 (최대 5개, Cloudflare R2)';
