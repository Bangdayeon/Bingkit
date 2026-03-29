-- 드래프트 빙고 첨부 시 셀/그리드/테마 스냅샷 저장용 컬럼
alter table public.posts
  add column if not exists bingo_snapshot jsonb;
