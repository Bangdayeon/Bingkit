-- posts.like_count 재계산
update public.posts
set like_count = (
  select count(*) from public.likes where post_id = posts.id
);

-- posts.comment_count 재계산 (소프트 딜리트 제외)
update public.posts
set comment_count = (
  select count(*) from public.comments
  where post_id = posts.id and is_deleted = false
);

-- comments.like_count 재계산
update public.comments
set like_count = (
  select count(*) from public.comment_likes where comment_id = comments.id
);
