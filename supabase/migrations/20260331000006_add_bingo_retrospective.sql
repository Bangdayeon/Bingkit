-- 완료된 빙고의 회고 텍스트 저장
alter table public.bingo_boards
  add column retrospective text check (char_length(retrospective) <= 500);
