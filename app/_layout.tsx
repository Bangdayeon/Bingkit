import '@/global.css';
import * as Sentry from '@sentry/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  enabled: !__DEV__,
  tracesSampleRate: 0.2,
});
import { supabase } from '@/lib/supabase';
import { registerForPushNotifications, savePushToken } from '@/lib/push-notifications';
import { router, Stack } from 'expo-router';
import { useEffect } from 'react';
import { Appearance } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BadgeCelebration } from '@/components/BadgeCelebration';

export default function RootLayout() {
  useEffect(() => {
    AsyncStorage.getItem('@bingket/app-theme').then((saved) => {
      if (saved === 'light' || saved === 'dark') {
        Appearance.setColorScheme(saved);
      } else {
        Appearance.setColorScheme(null);
      }
    });
  }, []);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const createdAt = new Date(session.user.created_at).getTime();
        const isNewUser = Date.now() - createdAt < 60_000;
        router.replace(isNewUser ? '/(auth)/onboarding' : '/(tabs)');
        // 신규 로그인 시 푸시 토큰 등록
        registerForPushNotifications().then((token) => {
          if (token) savePushToken(token);
        });
      } else if (event === 'INITIAL_SESSION' && session) {
        // 앱 재실행 시 이미 로그인된 경우에도 토큰 갱신
        registerForPushNotifications().then((token) => {
          if (token) savePushToken(token);
        });
      } else if (event === 'SIGNED_OUT') {
        router.replace('/(auth)/login');
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <SafeAreaProvider>
      <BadgeCelebration />
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="bingo/add" options={{ headerShown: false }} />
        <Stack.Screen name="bingo/modify" options={{ headerShown: false }} />
        <Stack.Screen name="bingo/view" options={{ headerShown: false }} />
        <Stack.Screen name="mypage/profile-edit" options={{ headerShown: false }} />
        <Stack.Screen name="mypage/account" options={{ headerShown: false }} />
        <Stack.Screen name="mypage/alert-setting" options={{ headerShown: false }} />
        <Stack.Screen name="mypage/app-theme" options={{ headerShown: false }} />
        <Stack.Screen name="mypage/my-posts" options={{ headerShown: false }} />
        <Stack.Screen name="community/search" options={{ headerShown: false }} />
        <Stack.Screen name="community/write" options={{ headerShown: false }} />
        <Stack.Screen name="community/[id]" options={{ headerShown: false }} />
      </Stack>
    </SafeAreaProvider>
  );
}
