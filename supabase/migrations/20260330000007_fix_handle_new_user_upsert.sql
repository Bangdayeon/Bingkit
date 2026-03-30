-- 재가입 시 public.users 행이 이미 존재하는 경우를 대비해 display_name 갱신
-- (username, bio, avatar_url 등 사용자 커스텀 값은 보존)
CREATE OR REPLACE FUNCTION handle_new_auth_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_username    text;
  v_display_name text;
BEGIN
  v_username := 'user_' || substr(replace(new.id::text, '-', ''), 1, 15);
  v_display_name := regexp_replace(
    coalesce(new.raw_user_meta_data->>'name', ''),
    '[^\uAC00-\uD7A3a-zA-Z0-9]', '', 'g'
  );
  IF length(v_display_name) = 0 THEN
    v_display_name := '빙고유저';
  END IF;
  v_display_name := substr(v_display_name, 1, 20);

  INSERT INTO public.users (id, username, display_name)
  VALUES (new.id, v_username, v_display_name)
  ON CONFLICT (id) DO UPDATE
    SET display_name = CASE
      -- 아직 기본값이면 provider 이름으로 덮어씀 (사용자 미수정 상태)
      WHEN public.users.display_name = '빙고유저' THEN EXCLUDED.display_name
      ELSE public.users.display_name
    END;

  RETURN new;
END;
$$;
