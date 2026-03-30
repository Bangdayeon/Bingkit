-- display_name constraint: 한글/영문/숫자만 허용, 공백·특수문자 제거
create or replace function handle_new_auth_user()
returns trigger language plpgsql security definer as $$
declare
  v_username text;
  v_display_name text;
begin
  v_username := 'user_' || substr(replace(new.id::text, '-', ''), 1, 15);
  -- 공백·특수문자 제거, 빈 값이면 기본값
  v_display_name := regexp_replace(
    coalesce(new.raw_user_meta_data->>'name', ''),
    '[^\uAC00-\uD7A3a-zA-Z0-9]', '', 'g'
  );
  if length(v_display_name) = 0 then
    v_display_name := '빙고유저';
  end if;
  v_display_name := substr(v_display_name, 1, 20);

  insert into public.users (id, username, display_name)
  values (new.id, v_username, v_display_name)
  on conflict (id) do nothing;

  return new;
end;
$$;
