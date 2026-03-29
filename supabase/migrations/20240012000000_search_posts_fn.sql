-- 게시글 전문 검색: 제목, 내용, 빙고 아이템(bingo_cells + bingo_snapshot), 댓글을 포함한 post id 반환
create or replace function search_post_ids(query_text text)
returns table(id uuid)
language sql
security definer
stable
as $$
  select distinct p.id
  from posts p
  left join bingo_boards bb on bb.id = p.bingo_board_id
  left join bingo_cells bc on bc.board_id = bb.id
  left join comments c on c.post_id = p.id and c.is_deleted = false
  where p.is_deleted = false
    and (
      p.title ilike '%' || query_text || '%'
      or p.content ilike '%' || query_text || '%'
      or p.bingo_snapshot::text ilike '%' || query_text || '%'
      or bc.content ilike '%' || query_text || '%'
      or c.content ilike '%' || query_text || '%'
    )
  limit 50;
$$;
