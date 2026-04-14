import { createClient } from 'npm:@supabase/supabase-js@2';

Deno.serve(async (req) => {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response('Unauthorized - no header', { status: 401 });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const adminClient = createClient(supabaseUrl, serviceKey);

  const token = authHeader.replace('Bearer ', '');

  const {
    data: { user },
    error: userError,
  } = await adminClient.auth.getUser(token);

  if (userError || !user) {
    return new Response('Unauthorized - invalid token', { status: 401 });
  }

  // 1. FK 걸린 데이터 먼저 삭제/정리
  await adminClient.from('notifications').delete().eq('user_id', user.id);

  await adminClient.from('comments').update({ user_id: null }).eq('user_id', user.id);

  await adminClient.from('posts').update({ user_id: null }).eq('user_id', user.id);

  await adminClient.from('bingo_boards').delete().eq('user_id', user.id);

  // 2. users 테이블 삭제
  const { error: userDeleteError } = await adminClient.from('users').delete().eq('id', user.id);

  if (userDeleteError) {
    console.error('users delete error:', userDeleteError);
    return new Response(userDeleteError.message, { status: 500 });
  }

  // 3. auth.users 삭제 (핵심)
  const { error: authDeleteError } = await adminClient.auth.admin.deleteUser(user.id);

  if (authDeleteError) {
    console.error('auth delete error:', authDeleteError);
    return new Response(authDeleteError.message, { status: 500 });
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
