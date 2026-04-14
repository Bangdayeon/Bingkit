import { createClient } from 'npm:@supabase/supabase-js@2';

Deno.serve(async (req) => {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response('Unauthorized', { status: 401 });
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
    return new Response('Unauthorized', { status: 401 });
  }

  const body = (await req.json()) as { content?: string };
  const content = body.content?.trim() ?? '';

  if (!content) {
    return new Response('content is required', { status: 400 });
  }
  if (content.length > 500) {
    return new Response('content must be 500 characters or fewer', { status: 400 });
  }

  const { error } = await adminClient.from('reports').insert({ user_id: user.id, content });

  if (error) {
    console.error('reports insert error:', error);
    return new Response(error.message, { status: 500 });
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
