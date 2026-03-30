-- Google OAuth 재로그인 시 auth.users가 UPDATE되어 trigger 미작동 문제 수정
-- INSERT + UPDATE 모두 감지하여 public.users 행 보장

create or replace function handle_new_auth_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.users (id, username, display_name)
  values (
    new.id,
    'user_' || substr(replace(new.id::text, '-', ''), 1, 16),
    coalesce(new.raw_user_meta_data->>'name', '빙고 유저')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- 기존 trigger 교체 (INSERT + UPDATE 모두 감지)
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert or update on auth.users
  for each row execute function handle_new_auth_user();
