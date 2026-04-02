-- 유저 검색 함수 (친구 여부 + 요청 상태 포함)
-- security definer로 실행되어 RLS 우회, private 계정은 where 절로 직접 필터
create or replace function public.search_users(keyword text)
returns table (
  id             uuid,
  username       text,
  display_name   text,
  avatar_url     text,
  is_friend      boolean,
  request_status text
)
language sql
security definer
set search_path = public
as $$
  select
    u.id,
    u.username,
    u.display_name,
    u.avatar_url,

    -- 친구 여부
    exists (
      select 1
      from public.friends f
      where f.user_id  = auth.uid()
        and f.friend_id = u.id
    ) as is_friend,

    -- 친구 요청 상태 (없으면 null)
    (
      select fr.status
      from public.friend_requests fr
      where (fr.sender_id = auth.uid() and fr.receiver_id = u.id)
         or (fr.sender_id = u.id       and fr.receiver_id = auth.uid())
      order by fr.created_at desc
      limit 1
    ) as request_status

  from public.users u
  where
    u.deleted_at is null
    and u.is_private = false          -- 비공개 계정 제외
    and u.id != coalesce(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid)
    and (
      keyword is null
      or keyword = ''
      or u.username     ilike '%' || keyword || '%'
      or u.display_name ilike '%' || keyword || '%'
    )
  order by u.username asc
  limit 30;
$$;