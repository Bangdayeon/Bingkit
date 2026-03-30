-- comments 테이블에 like_count 추가
alter table public.comments add column if not exists like_count int not null default 0;

-- 기존 comment_likes 데이터로 초기값 동기화
update public.comments c
set like_count = (
  select count(*) from public.comment_likes cl where cl.comment_id = c.id
);

-- comment_likes insert 시 like_count 증가
create or replace function increment_comment_like_count()
returns trigger language plpgsql as $$
begin
  update public.comments set like_count = like_count + 1 where id = new.comment_id;
  return new;
end;
$$;

create trigger trg_comment_like_insert
  after insert on public.comment_likes
  for each row execute function increment_comment_like_count();

-- comment_likes delete 시 like_count 감소
create or replace function decrement_comment_like_count()
returns trigger language plpgsql as $$
begin
  update public.comments set like_count = greatest(like_count - 1, 0) where id = old.comment_id;
  return old;
end;
$$;

create trigger trg_comment_like_delete
  after delete on public.comment_likes
  for each row execute function decrement_comment_like_count();
