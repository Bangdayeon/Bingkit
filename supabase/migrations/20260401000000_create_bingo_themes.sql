create table public.bingo_themes (
  id text primary key,           -- 'default', 'rabbit' ...
  display_name text not null,    -- '기본', '토끼' ...
  grid_3x3_url text not null,
  grid_4x3_url text not null,
  grid_4x4_url text not null,
  check_url text not null,
  foreground_color text not null default '#181C1C',
  created_at timestamptz not null default now()
);

alter table public.bingo_themes enable row level security;

create policy "bingo_themes: 누구나 조회"
on public.bingo_themes
for select
using (true);