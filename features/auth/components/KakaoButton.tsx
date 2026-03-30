import * as Sentry from '@sentry/react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import { Text } from '@/components/Text';
import { supabase } from '@/lib/supabase';

WebBrowser.maybeCompleteAuthSession();

const KAKAO_REST_API_KEY = process.env.EXPO_PUBLIC_KAKAO_REST_API_KEY ?? '';
const KAKAO_REDIRECT_URI = 'https://ypwrjasfpjhtghiarxvg.supabase.co/functions/v1/kakao-callback';

async function signInWithKakao(): Promise<void> {
  const kakaoAuthUrl =
    `https://kauth.kakao.com/oauth/authorize` +
    `?client_id=${KAKAO_REST_API_KEY}` +
    `&redirect_uri=${encodeURIComponent(KAKAO_REDIRECT_URI)}` +
    `&response_type=code`;

  await WebBrowser.openBrowserAsync(kakaoAuthUrl);
}

async function handleDeepLink(url: string) {
  try {
    const parsed = Linking.parse(url);

    const access_token =
      (parsed.queryParams?.access_token as string | undefined) ??
      extractFromFragment(url, 'access_token');

    const refresh_token =
      (parsed.queryParams?.refresh_token as string | undefined) ??
      extractFromFragment(url, 'refresh_token');

    if (!access_token || !refresh_token) return;

    const { error } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    });

    if (error) {
      Sentry.captureException(error);
    }
  } catch (e) {
    Sentry.captureException(e);
  }
}

// fragment 파싱 유틸 (#access_token=...)
function extractFromFragment(url: string, key: string) {
  const fragment = url.split('#')[1];
  if (!fragment) return undefined;

  const params = new URLSearchParams(fragment);
  return params.get(key) ?? undefined;
}

export function KakaoButton() {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 앱 실행 중 딥링크 수신
    const sub = Linking.addEventListener('url', ({ url }) => {
      console.log('DEEPLINK:', url);
      handleDeepLink(url);
    });

    // 앱이 꺼져있다가 열릴 때
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink(url);
    });

    return () => sub.remove();
  }, []);

  const handlePress = async () => {
    setLoading(true);
    try {
      await signInWithKakao();
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={loading}
      className="w-full h-14 rounded-xl bg-kakao items-center justify-center"
    >
      {loading ? (
        <ActivityIndicator size="small" color="#000" />
      ) : (
        <>
          <Image
            source={require('@/assets/icons/kakao_logo.png')}
            style={{ width: 18, height: 18 }}
            className="absolute left-4"
            resizeMode="contain"
          />
          <Text className="text-base font-semibold">카카오로 시작하기</Text>
        </>
      )}
    </TouchableOpacity>
  );
}
