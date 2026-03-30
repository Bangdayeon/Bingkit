import { createClient } from 'npm:@supabase/supabase-js@2';

const KAKAO_CLIENT_ID = Deno.env.get('KAKAO_REST_API_KEY') ?? '';
const REDIRECT_URI = Deno.env.get('KAKAO_REDIRECT_URI') ?? '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

function err(msg: string, status = 500) {
  return new Response(JSON.stringify({ error: msg }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    if (!code) return err('Missing code', 400);

    // 1. 카카오 토큰 발급
    const tokenRes = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: KAKAO_CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        code,
      }),
    });

    const tokenData = await tokenRes.json();
    const kakaoAccessToken = tokenData.access_token as string | undefined;
    if (!kakaoAccessToken) {
      return err(`Kakao token error: ${JSON.stringify(tokenData)}`);
    }

    // 2. 카카오 유저 정보 조회
    const userRes = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: { Authorization: `Bearer ${kakaoAccessToken}` },
    });

    const kakaoUser = await userRes.json();
    if (!kakaoUser.id) {
      return err(`Kakao user error: ${JSON.stringify(kakaoUser)}`);
    }

    const kakaoId = String(kakaoUser.id);
    const nickname =
      (kakaoUser.kakao_account?.profile?.nickname as string | undefined) ?? '빙고유저';

    const email = `${kakaoId}@kakao.bingket`;

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    // 3. auth 유저 조회
    const searchRes = await fetch(
      `${SUPABASE_URL}/auth/v1/admin/users?filter=${encodeURIComponent(email)}&per_page=1`,
      {
        headers: {
          apikey: SERVICE_KEY,
          Authorization: `Bearer ${SERVICE_KEY}`,
        },
      },
    );

    const searchBody = await searchRes.json();
    const existingUsers: Array<{ id: string; email?: string }> = searchBody.users ?? [];

    let userId: string;

    const existing = existingUsers.find((u) => u.email === email);

    if (existing) {
      userId = existing.id;
    } else {
      const { data: newUser, error: createError } = await admin.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: {
          kakao_id: kakaoId,
          name: nickname,
        },
      });

      if (createError || !newUser.user) {
        return err(`createUser error: ${createError?.message}`);
      }

      userId = newUser.user.id;
    }

    // 4. public.users upsert
    const username = 'user_' + userId.replace(/-/g, '').slice(0, 15);

    const safeDisplayName =
      nickname.replace(/[^\uAC00-\uD7A3a-zA-Z0-9]/g, '').slice(0, 20) || '빙고유저';

    const { error: upsertError } = await admin.from('users').upsert(
      {
        id: userId,
        username,
        display_name: safeDisplayName,
      },
      {
        onConflict: 'id',
      },
    );

    if (upsertError) {
      return err(`upsert users error: ${upsertError.message}`);
    }

    // 5. magiclink 생성
    const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: {
        redirectTo: 'bingket://auth/kakao-callback',
      },
    });

    if (linkError || !linkData?.properties?.action_link) {
      return err(`generateLink error: ${linkError?.message}`);
    }

    return Response.redirect(linkData.properties.action_link, 302);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return err(`Unhandled exception: ${msg}`);
  }
});
