-- 재가입 시 public.users 행 생성을 위한 INSERT 정책
-- (Google 등 소셜 재로그인 시 trigger 미작동 대비, _layout.tsx에서 upsert 처리)
create policy "users: 본인 행 생성 가능" on public.users
  for insert with check (auth.uid() = id);
