-- notifications.type에 친구 요청 관련 타입 추가
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
    'battle_accepted',
    'friend_request'
  ));
