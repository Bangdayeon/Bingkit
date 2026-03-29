-- ── push_tokens: 사용자별 Expo 푸시 토큰 ──────────────────────
create table if not exists public.push_tokens (
  user_id    uuid primary key references public.users(id) on delete cascade,
  token      text not null,
  platform   text not null check (platform in ('ios', 'android')),
  updated_at timestamptz not null default now()
);

alter table public.push_tokens enable row level security;

drop policy if exists "push_tokens: 본인만" on public.push_tokens;
create policy "push_tokens: 본인만" on public.push_tokens
  for all using (auth.uid() = user_id);

-- ── notification_settings: 사용자별 알림 수신 설정 ────────────
create table if not exists public.notification_settings (
  user_id           uuid primary key references public.users(id) on delete cascade,
  bingo_deadline    boolean not null default false,
  bingo_daily       boolean not null default true,
  community_popular boolean not null default false,
  community_comment boolean not null default true,
  community_like    boolean not null default false,
  event_push        boolean not null default true,
  updated_at        timestamptz not null default now()
);

alter table public.notification_settings enable row level security;

drop policy if exists "notification_settings: 본인만" on public.notification_settings;
create policy "notification_settings: 본인만" on public.notification_settings
  for all using (auth.uid() = user_id);
