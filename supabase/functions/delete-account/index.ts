import { createClient } from 'npm:@supabase/supabase-js@2';

Deno.serve(async (req) => {
  const authHeader = req.headers.get('Authorization');

  if (!authHeader) {
    return new Response('Unauthorized - no header', { status: 401 });
  }

  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  const adminClient = createClient(Deno.env.get('SUPABASE_URL') ?? '', serviceKey);

  const token = authHeader.replace('Bearer ', '');
  const {
    data: { user },
    error,
  } = await adminClient.auth.getUser(token);

  if (error || !user) {
    return new Response('Unauthorized - invalid token', { status: 401 });
  }

  const now = new Date().toISOString();

  // 1. 유저 anonymize + soft delete
  await adminClient
    .from('users')
    .update({
      deleted_at: now,
      display_name: '알 수 없음',
      avatar_url: null,
      bio: null,
      is_private: false,
    })
    .eq('id', user.id);

  // 2. 빙고 soft delete
  await adminClient
    .from('bingo_boards')
    .update({ deleted_at: now })
    .eq('user_id', user.id)
    .is('deleted_at', null);

  // 3. 게시글 → 남기되 작성자 끊기
  await adminClient
    .from('posts')
    .update({
      user_id: null,
      is_deleted: false,
    })
    .eq('user_id', user.id);

  // 4. 댓글 → 남기되 작성자 끊기
  await adminClient
    .from('comments')
    .update({
      user_id: null,
      is_deleted: false,
    })
    .eq('user_id', user.id);

  // 5. 알림 삭제
  await adminClient.from('notifications').delete().eq('user_id', user.id);

  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
