import { createClient } from 'npm:@supabase/supabase-js@2';

Deno.serve(async (req) => {
  console.log('--- delete-account start ---');

  const authHeader = req.headers.get('Authorization');
  console.log('authHeader:', authHeader ? 'exists' : 'missing');

  if (!authHeader) {
    return new Response('Unauthorized - no header', { status: 401 });
  }

  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';

  console.log('env check:', {
    hasServiceKey: !!serviceKey,
    hasUrl: !!supabaseUrl,
  });

  const adminClient = createClient(supabaseUrl, serviceKey);

  const token = authHeader.replace('Bearer ', '');
  console.log('token length:', token.length);

  const {
    data: { user },
    error: userError,
  } = await adminClient.auth.getUser(token);

  console.log('auth result:', { user, userError });

  if (userError || !user) {
    return new Response('Unauthorized - invalid token', { status: 401 });
  }

  const now = new Date().toISOString();
  console.log('user.id:', user.id);

  // 1. users
  const { data: userUpdate, error: userUpdateError } = await adminClient
    .from('users')
    .update({
      deleted_at: now,
      display_name: 'unknown',
      avatar_url: null,
      bio: null,
      is_private: false,
    })
    .eq('id', user.id)
    .select();

  console.log('users update:', { userUpdate, userUpdateError });

  // 2. bingo_boards
  const { data: bingoUpdate, error: bingoError } = await adminClient
    .from('bingo_boards')
    .update({ deleted_at: now })
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .select();

  console.log('bingo update:', { bingoUpdate, bingoError });

  // 3. posts
  const { data: postUpdate, error: postError } = await adminClient
    .from('posts')
    .update({
      user_id: null,
      is_deleted: false,
    })
    .eq('user_id', user.id)
    .select();

  console.log('posts update:', { postUpdate, postError });

  // 4. comments
  const { data: commentUpdate, error: commentError } = await adminClient
    .from('comments')
    .update({
      user_id: null,
      is_deleted: false,
    })
    .eq('user_id', user.id)
    .select();

  console.log('comments update:', { commentUpdate, commentError });

  // 5. notifications
  const { data: notiDelete, error: notiError } = await adminClient
    .from('notifications')
    .delete()
    .eq('user_id', user.id)
    .select();

  console.log('notifications delete:', { notiDelete, notiError });

  console.log('--- delete-account end ---');

  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
