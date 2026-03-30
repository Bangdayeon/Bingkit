alter table public.notifications
  drop constraint if exists notifications_type_check;

alter table public.notifications
  add constraint notifications_type_check
  check (type in (
    'bingo_reminder',
    'bingo_dday',
    'comment',
    'reply',
    'like',
    'popular',
    'badge'
  ));

alter table public.notifications
  drop constraint if exists notifications_target_type_check;

alter table public.notifications
  add constraint notifications_target_type_check
  check (target_type in ('post', 'bingo_board', 'badge'));