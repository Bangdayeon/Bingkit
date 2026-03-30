-- username 최대 20자 제약 위반 수정: user_(5) + 16자 = 21자 → 15자로 수정
create or replace function handle_new_auth_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.users (id, username, display_name)
  values (
    new.id,
    'user_' || substr(replace(new.id::text, '-', ''), 1, 15),
    coalesce(new.raw_user_meta_data->>'name', '빙고유저')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
