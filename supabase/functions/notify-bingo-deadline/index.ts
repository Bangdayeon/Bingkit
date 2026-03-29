import { createClient } from 'npm:@supabase/supabase-js@2';

async function sendExpoPush(
  token: string,
  title: string,
  body: string,
  data?: Record<string, string>,
): Promise<void> {
  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ to: token, title, body, data, sound: 'default' }),
  });
}

Deno.serve(async (req) => {
  // Supabase Cron은 Authorization: Bearer {service_role_key} 로 호출
  const authHeader = req.headers.get('Authorization');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  if (!authHeader || authHeader !== `Bearer ${serviceKey}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', serviceKey);

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  // D-10, D-5 기준일 계산
  const checkPoints = [
    { daysLeft: 10, date: new Date(today.getTime() + 10 * 86_400_000) },
    { daysLeft: 5, date: new Date(today.getTime() + 5 * 86_400_000) },
  ];

  let sent = 0;

  for (const { daysLeft, date } of checkPoints) {
    const dateStr = date.toISOString().split('T')[0];

    const { data: boards } = await supabase
      .from('bingo_boards')
      .select('id, user_id, title')
      .eq('target_date', dateStr)
      .in('status', ['progress', 'done'])
      .is('deleted_at', null);

    for (const board of boards ?? []) {
      // 알림 설정 확인
      const { data: settings } = await supabase
        .from('notification_settings')
        .select('bingo_deadline')
        .eq('user_id', board.user_id)
        .single();

      if (!settings?.bingo_deadline) continue;

      // 푸시 토큰 조회
      const { data: tokenRow } = await supabase
        .from('push_tokens')
        .select('token')
        .eq('user_id', board.user_id)
        .single();

      if (!tokenRow?.token) continue;

      await sendExpoPush(
        tokenRow.token,
        '⏰ 빙고 기간 임박',
        `'${(board.title as string).slice(0, 20)}' 빙고의 기간이 ${daysLeft}일 남았어요!`,
        { boardId: board.id as string },
      );

      sent++;
    }
  }

  return new Response(JSON.stringify({ ok: true, sent }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
