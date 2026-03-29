-- ── bingo_cells에 최초 체크 시각 컬럼 추가 ────────────────────
alter table public.bingo_cells
  add column if not exists first_checked_at timestamptz;

-- ── user_stats: 유저별 누적 통계 ──────────────────────────────
create table if not exists public.user_stats (
  user_id           uuid primary key references public.users(id) on delete cascade,
  total_cell_checks int not null default 0,
  updated_at        timestamptz not null default now()
);

alter table public.user_stats enable row level security;

drop policy if exists "user_stats: 본인 조회" on public.user_stats;
create policy "user_stats: 본인 조회" on public.user_stats
  for select using (auth.uid() = user_id);

-- ── 트리거 함수: 최초 체크 시만 카운트 증가 ──────────────────
create or replace function handle_bingo_cell_first_check()
returns trigger language plpgsql security definer as $$
begin
  -- false → true 전환이고, 이전에 한 번도 체크된 적 없을 때만
  if NEW.is_checked = true
    and OLD.is_checked = false
    and OLD.first_checked_at is null
  then
    -- first_checked_at 기록 (이후 재체크 방지)
    NEW.first_checked_at := now();

    -- user_stats upsert (board_id → user_id 조인)
    insert into public.user_stats (user_id, total_cell_checks, updated_at)
    select bb.user_id, 1, now()
    from public.bingo_boards bb
    where bb.id = NEW.board_id
    on conflict (user_id) do update
      set total_cell_checks = user_stats.total_cell_checks + 1,
          updated_at = now();
  end if;

  return NEW;
end;
$$;

drop trigger if exists on_bingo_cell_first_check on public.bingo_cells;
create trigger on_bingo_cell_first_check
  before update on public.bingo_cells
  for each row
  when (NEW.is_checked is distinct from OLD.is_checked)
  execute function handle_bingo_cell_first_check();
