-- 신규 가입 시 username 초기값을 이메일 @앞자리로 지정
-- 예: bangdayeon@gmail.com → bangdayeon (중복이면 bangdayeon1, bangdayeon2 …)

create or replace function handle_new_auth_user()
returns trigger language plpgsql security definer as $$
declare
  base_username text;
  candidate     text;
  suffix        int := 0;
begin
  -- 이메일 @앞 부분 추출 (new.email 우선, 없으면 raw_user_meta_data)
  base_username := split_part(
    coalesce(new.email, new.raw_user_meta_data->>'email', ''),
    '@', 1
  );

  -- 영숫자·밑줄·점만 허용, 소문자 변환
  base_username := lower(regexp_replace(base_username, '[^a-zA-Z0-9_.]', '', 'g'));

  -- 빈 문자열 방지 (이메일 없는 경우 fallback)
  if base_username = '' then
    base_username := 'user_' || substr(replace(new.id::text, '-', ''), 1, 8);
  end if;

  -- 중복이면 숫자 suffix 추가
  candidate := base_username;
  loop
    exit when not exists (select 1 from public.users where username = candidate);
    suffix    := suffix + 1;
    candidate := base_username || suffix::text;
  end loop;

  insert into public.users (id, username, display_name)
  values (
    new.id,
    candidate,
    coalesce(new.raw_user_meta_data->>'name', '빙고 유저')
  );
  return new;
end;
$$;
