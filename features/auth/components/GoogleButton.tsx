import { supabase } from '@/lib/supabase';
import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import { Text } from '@/components/Text';

WebBrowser.maybeCompleteAuthSession();

const REDIRECT_URI = makeRedirectUri({ scheme: 'bingket', path: 'auth/callback' });

async function signInWithGoogle(): Promise<void> {
  console.log('[Google] REDIRECT_URI:', REDIRECT_URI);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: REDIRECT_URI,
      skipBrowserRedirect: true,
    },
  });

  if (error || !data.url) {
    console.error('[Google] OAuth URL 오류:', error);
    return;
  }
  console.log('[Google] OAuth URL 획득 성공');

  const result = await WebBrowser.openAuthSessionAsync(data.url, REDIRECT_URI);
  console.log('[Google] WebBrowser result type:', result.type);
  if (result.type === 'success') console.log('[Google] result.url:', result.url);

  if (result.type !== 'success' || !result.url) return;

  // implicit flow: 토큰이 hash fragment(#)에 포함됨
  const fragment = result.url.split('#')[1] ?? '';
  const params = Object.fromEntries(fragment.split('&').map((p) => p.split('=')));
  const accessToken = params['access_token'];
  const refreshToken = params['refresh_token'];

  if (!accessToken || !refreshToken) {
    console.error('[Google] 토큰 파싱 실패');
    return;
  }

  const { error: sessionError } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
  if (sessionError) {
    console.error('[Google] setSession 오류:', sessionError);
  } else {
    console.log('[Google] setSession 성공 → onAuthStateChange 대기 중');
  }
}

export function GoogleButton() {
  const [loading, setLoading] = useState(false);

  const handlePress = async () => {
    setLoading(true);
    await signInWithGoogle();
    setLoading(false);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={loading}
      className="w-full h-14 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 items-center justify-center"
    >
      {loading ? (
        <ActivityIndicator size="small" color="#000" />
      ) : (
        <>
          <Image
            source={require('@/assets/icons/google_logo.png')}
            style={{ width: 18, height: 18 }}
            className="absolute left-4"
            resizeMode="contain"
          />
          <Text className="text-black text-base font-semibold">Google로 시작하기</Text>
        </>
      )}
    </TouchableOpacity>
  );
}
