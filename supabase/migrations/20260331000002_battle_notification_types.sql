-- notifications.type에 배틀 관련 타입 추가
-- battle_request: 배틀 요청 수신
-- battle_accepted: 배틀 요청 수락됨

alter table public.notifications drop constraint notifications_type_check;

alter table public.notifications
  add constraint notifications_type_check check (type in (
    'bingo_reminder',
    'bingo_dday',
    'comment',
    'reply',
    'like',
    'popular',
    'battle_request',
    'battle_accepted'
  ));