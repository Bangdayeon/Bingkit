-- ============================================================
-- 친구 시스템 + 빙고 배틀 시스템
-- ============================================================


-- ============================================================
-- 1. friend_requests  (친구 요청)
-- ============================================================
create table public.friend_requests (
  id           uuid primary key default gen_random_uuid(),
  sender_id    uuid not null references public.users (id) on delete cascade,
  receiver_id  uuid not null references public.users (id) on delete cascade,
  status       text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  created_at   timestamptz not null default now(),
  -- 동일 방향 중복 요청 방지
  unique (sender_id, receiver_id),
  -- 자기 자신에게 요청 불가
  constraint friend_requests_no_self_request check (sender_id != receiver_id)
);

comment on table public.friend_requests is '친구 요청 (pending | accepted | rejected)';

-- 역방향 중복 요청 방지 (A→B 요청이 있으면 B→A 요청 불가)
create or replace function check_reverse_friend_request()
returns trigger language plpgsql as $$
begin
  if exists (
    select 1 from public.friend_requests
    where sender_id = new.receiver_id
      and receiver_id = new.sender_id
      and status = 'pending'
  ) then
    raise exception '이미 상대방이 보낸 친구 요청이 있습니다.';
  end if;
  return new;
end;
$$;

create trigger trg_check_reverse_friend_request
  before insert on public.friend_requests
  for each row execute function check_reverse_friend_request();

-- 비공개 계정에게는 친구 요청 불가 (receiver가 private이면 차단)
create or replace function check_receiver_not_private()
returns trigger language plpgsql as $$
begin
  if exists (
    select 1 from public.users
    where id = new.receiver_id
      and is_private = true
  ) then
    raise exception '비공개 계정에는 친구 요청을 보낼 수 없습니다.';
  end if;
  return new;
end;
$$;

create trigger trg_check_receiver_not_private
  before insert on public.friend_requests
  for each row execute function check_receiver_not_private();


-- ============================================================
-- 2. friends  (친구 관계, 양방향 저장)
-- ============================================================
create table public.friends (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users (id) on delete cascade,
  friend_id   uuid not null references public.users (id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (user_id, friend_id),
  constraint friends_no_self check (user_id != friend_id)
);

comment on table public.friends is '친구 관계 (양방향 저장: A→B, B→A 모두 존재)';

-- friend_request 수락 시 양방향 친구 등록 + 요청 상태 업데이트
-- SECURITY DEFINER: RLS를 우회하여 friends 테이블에 직접 삽입
create or replace function accept_friend_request()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if old.status = 'pending' and new.status = 'accepted' then
    insert into public.friends (user_id, friend_id) values
      (new.sender_id,   new.receiver_id),
      (new.receiver_id, new.sender_id)
    on conflict do nothing;
  end if;
  return new;
end;
$$;

create trigger trg_accept_friend_request
  after update of status on public.friend_requests
  for each row execute function accept_friend_request();


-- ============================================================
-- 3. User Search: 비공개 계정 검색 차단 (RLS)
-- ============================================================
-- 기존 "users: 전체 조회 가능" 정책을 교체하여 is_private = true 유저 검색 차단
drop policy if exists "users: 전체 조회 가능" on public.users;

create policy "users: 공개 계정만 조회 가능 (본인 제외)" on public.users
  for select using (
    deleted_at is null
    and (
      is_private = false
      or id = auth.uid()
    )
  );


-- ============================================================
-- 4. battle_requests  (배틀 요청)
-- ============================================================
create table public.battle_requests (
  id                 uuid primary key default gen_random_uuid(),
  sender_id          uuid not null references public.users (id) on delete cascade,
  receiver_id        uuid not null references public.users (id) on delete cascade,
  sender_board_id    uuid not null references public.bingo_boards (id) on delete cascade,
  receiver_board_id  uuid references public.bingo_boards (id) on delete cascade,  -- 수락 시 설정
  bet_text           text,
  status             text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  created_at         timestamptz not null default now(),
  constraint battle_requests_no_self check (sender_id != receiver_id)
);

comment on table public.battle_requests is '배틀 요청 (receiver_board_id는 수락 시 설정)';

-- sender_board가 progress 상태이고 본인 소유인지 확인
create or replace function check_battle_request_constraints()
returns trigger language plpgsql as $$
begin
  -- sender_board가 본인 소유 + progress 상태 확인
  if not exists (
    select 1 from public.bingo_boards
    where id = new.sender_board_id
      and user_id = new.sender_id
      and status = 'progress'
      and deleted_at is null
  ) then
    raise exception '배틀에 사용할 빙고판은 본인 소유의 진행 중인 빙고여야 합니다.';
  end if;

  -- sender와 receiver가 친구 관계인지 확인
  if not exists (
    select 1 from public.friends
    where user_id = new.sender_id
      and friend_id = new.receiver_id
  ) then
    raise exception '친구에게만 배틀을 요청할 수 있습니다.';
  end if;

  return new;
end;
$$;

create trigger trg_check_battle_request_constraints
  before insert on public.battle_requests
  for each row execute function check_battle_request_constraints();

-- receiver_board 설정 시 유효성 검증 (수락 흐름)
create or replace function check_battle_request_receiver_board()
returns trigger language plpgsql as $$
begin
  if new.receiver_board_id is not null then
    -- receiver_board가 receiver 소유 + progress 상태 확인
    if not exists (
      select 1 from public.bingo_boards
      where id = new.receiver_board_id
        and user_id = new.receiver_id
        and status = 'progress'
        and deleted_at is null
    ) then
      raise exception '수락에 사용할 빙고판은 본인 소유의 진행 중인 빙고여야 합니다.';
    end if;
  end if;
  return new;
end;
$$;

create trigger trg_check_battle_request_receiver_board
  before update of receiver_board_id on public.battle_requests
  for each row execute function check_battle_request_receiver_board();


-- ============================================================
-- 5. battles  (진행 중인 배틀)
-- ============================================================
create table public.battles (
  id          uuid primary key default gen_random_uuid(),
  user1_id    uuid not null references public.users (id) on delete cascade,
  user2_id    uuid not null references public.users (id) on delete cascade,
  board1_id   uuid not null references public.bingo_boards (id) on delete cascade,
  board2_id   uuid not null references public.bingo_boards (id) on delete cascade,
  score1      int not null default 0,
  score2      int not null default 0,
  bet_text    text,
  status      text not null default 'in_progress' check (status in ('in_progress', 'completed')),
  end_date    date,
  created_at  timestamptz not null default now(),
  -- 하나의 빙고판은 하나의 배틀에만 참가 가능
  unique (board1_id),
  unique (board2_id),
  constraint battles_no_self check (user1_id != user2_id),
  constraint battles_different_boards check (board1_id != board2_id)
);

comment on table public.battles is '빙고 배틀 (in_progress | completed). score는 앱단에서 계산 후 업데이트';
comment on column public.battles.score1 is 'user1의 점수: 체크 칸 수 + 빙고 라인 보너스';
comment on column public.battles.score2 is 'user2의 점수: 체크 칸 수 + 빙고 라인 보너스';
comment on column public.battles.end_date is '두 빙고판의 target_date 중 더 늦은 날짜';
comment on column public.battles.bet_text is '배틀 내기 내용';

-- 배틀 생성 시 제약 검증 + end_date 자동 설정
create or replace function check_and_initialize_battle()
returns trigger language plpgsql as $$
declare
  v_board1_target  date;
  v_board2_target  date;
begin
  -- board1이 user1 소유 + progress 상태
  if not exists (
    select 1 from public.bingo_boards
    where id = new.board1_id
      and user_id = new.user1_id
      and status = 'progress'
      and deleted_at is null
  ) then
    raise exception 'board1은 user1 소유의 진행 중인 빙고여야 합니다.';
  end if;

  -- board2가 user2 소유 + progress 상태
  if not exists (
    select 1 from public.bingo_boards
    where id = new.board2_id
      and user_id = new.user2_id
      and status = 'progress'
      and deleted_at is null
  ) then
    raise exception 'board2는 user2 소유의 진행 중인 빙고여야 합니다.';
  end if;

  -- 두 유저가 친구 관계인지 확인
  if not exists (
    select 1 from public.friends
    where user_id = new.user1_id
      and friend_id = new.user2_id
  ) then
    raise exception '배틀은 친구 사이에서만 가능합니다.';
  end if;

  -- end_date = GREATEST(board1.target_date, board2.target_date)
  select target_date into v_board1_target
    from public.bingo_boards where id = new.board1_id;
  select target_date into v_board2_target
    from public.bingo_boards where id = new.board2_id;

  new.end_date := greatest(v_board1_target, v_board2_target);

  return new;
end;
$$;

create trigger trg_check_and_initialize_battle
  before insert on public.battles
  for each row execute function check_and_initialize_battle();


-- ============================================================
-- 6. RLS 활성화 및 정책
-- ============================================================
alter table public.friend_requests  enable row level security;
alter table public.friends           enable row level security;
alter table public.battle_requests   enable row level security;
alter table public.battles           enable row level security;

-- friend_requests: sender/receiver만 접근
create policy "friend_requests: 본인(송신/수신)만 조회" on public.friend_requests
  for select using (
    auth.uid() = sender_id or auth.uid() = receiver_id
  );

create policy "friend_requests: sender만 작성" on public.friend_requests
  for insert with check (auth.uid() = sender_id);

create policy "friend_requests: receiver만 수락/거절" on public.friend_requests
  for update using (auth.uid() = receiver_id);

create policy "friend_requests: sender만 취소(삭제)" on public.friend_requests
  for delete using (auth.uid() = sender_id);

-- friends: 관계 당사자만 접근
create policy "friends: 본인만 조회" on public.friends
  for select using (
    auth.uid() = user_id or auth.uid() = friend_id
  );

-- INSERT는 accept_friend_request() SECURITY DEFINER 트리거만 처리
-- 별도 insert 정책 없음 → RLS에 의해 클라이언트 직접 삽입 차단

create policy "friends: 본인만 삭제" on public.friends
  for delete using (
    auth.uid() = user_id or auth.uid() = friend_id
  );

-- battle_requests: sender/receiver만 접근
create policy "battle_requests: 본인(송신/수신)만 조회" on public.battle_requests
  for select using (
    auth.uid() = sender_id or auth.uid() = receiver_id
  );

create policy "battle_requests: sender만 작성" on public.battle_requests
  for insert with check (auth.uid() = sender_id);

create policy "battle_requests: receiver만 수락/거절" on public.battle_requests
  for update using (auth.uid() = receiver_id);

-- battles: 참여자 두 명만 접근
create policy "battles: 참여자만 조회" on public.battles
  for select using (
    auth.uid() = user1_id or auth.uid() = user2_id
  );

create policy "battles: 참여자만 작성" on public.battles
  for insert with check (
    auth.uid() = user1_id or auth.uid() = user2_id
  );

create policy "battles: 참여자만 점수 업데이트" on public.battles
  for update using (
    auth.uid() = user1_id or auth.uid() = user2_id
  );


-- ============================================================
-- 7. 인덱스
-- ============================================================
create index idx_friend_requests_sender_id    on public.friend_requests (sender_id);
create index idx_friend_requests_receiver_id  on public.friend_requests (receiver_id);
create index idx_friend_requests_status       on public.friend_requests (status);

create index idx_friends_user_id              on public.friends (user_id);
create index idx_friends_friend_id            on public.friends (friend_id);

create index idx_battle_requests_sender_id    on public.battle_requests (sender_id);
create index idx_battle_requests_receiver_id  on public.battle_requests (receiver_id);
create index idx_battle_requests_status       on public.battle_requests (status);

create index idx_battles_user1_id             on public.battles (user1_id);
create index idx_battles_user2_id             on public.battles (user2_id);
create index idx_battles_status               on public.battles (status);
create index idx_battles_end_date             on public.battles (end_date);

-- ============================================================
-- 8. User Search (전체 유저 검색 + 친구 상태)
-- ============================================================
create or replace function public.search_users(keyword text)
returns table (
  id uuid,
  username text,
  display_name text,
  avatar_url text,
  is_friend boolean,
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
      where f.user_id = auth.uid()
        and f.friend_id = u.id
    ) as is_friend,

    -- 친구 요청 상태 (없으면 null)
    (
      select fr.status
      from public.friend_requests fr
      where
        (fr.sender_id = auth.uid() and fr.receiver_id = u.id)
        or
        (fr.sender_id = u.id and fr.receiver_id = auth.uid())
      order by fr.created_at desc
      limit 1
    ) as request_status

  from public.users u
  where
    u.deleted_at is null

    -- 본인 제외
    and u.id != auth.uid()

    -- RLS로 private 자동 필터됨

    -- 검색 조건
    and (
      keyword is null
      or keyword = ''
      or u.username ilike '%' || keyword || '%'
      or u.display_name ilike '%' || keyword || '%'
    )

  order by u.username asc
  limit 30;
$$;