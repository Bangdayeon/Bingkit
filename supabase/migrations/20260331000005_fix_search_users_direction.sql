-- search_users: request_status를 단방향(현재 유저가 sender인 경우만)으로 수정
-- 이전에는 양방향 조회로 인해 상대방이 보낸 요청도 '요청됨'으로 표시되는 버그 존재
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

    -- 내가 보낸 요청 상태만 (단방향: sender = 나)
    (
      select fr.status
      from public.friend_requests fr
      where fr.sender_id   = auth.uid()
        and fr.receiver_id = u.id
      order by fr.created_at desc
      limit 1
    ) as request_status

  from public.users u
  where
    u.deleted_at is null
    and u.is_private = false
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
