-- users 프로필 필드 제약 조건
-- 닉네임: 한글/영어/숫자, 20자 이내
-- 아이디: 영어/숫자/밑줄/하이픈, 20자 이내
-- 한줄다짐: 50자 이내

alter table public.users
  add constraint users_display_name_format
    check (
      length(display_name) <= 20
      and display_name ~ '^[\uAC00-\uD7A3a-zA-Z0-9]+$'
    );

alter table public.users
  add constraint users_username_format
    check (
      length(username) <= 20
      and username ~ '^[a-zA-Z0-9_\-]+$'
    );

alter table public.users
  add constraint users_bio_length
    check (bio is null or length(bio) <= 50);
