-- posts 삽입 시 user_id 미지정이면 auth.uid()로 자동 설정 (안전망)
CREATE OR REPLACE FUNCTION set_user_id_on_insert()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NEW.user_id IS NULL THEN
    NEW.user_id := auth.uid();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_set_user_id ON posts;

CREATE TRIGGER trigger_set_user_id
BEFORE INSERT ON posts
FOR EACH ROW
EXECUTE FUNCTION set_user_id_on_insert();
