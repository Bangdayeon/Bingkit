import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';

export default function SplashScreen() {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(async () => {
      const [
        {
          data: { session },
        },
        onboardingSeen,
      ] = await Promise.all([
        supabase.auth.getSession(),
        AsyncStorage.getItem('@bingket/onboarding-seen'),
      ]);

      if (session) {
        router.replace('/(tabs)');
      } else if (!onboardingSeen) {
        router.replace('/(auth)/onboarding');
      } else {
        router.replace('/(auth)/login');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View className="flex-1 w-full h-full items-center justify-center bg-white dark:bg-gray-900">
      <Animated.Image
        source={require('../assets/logo_300.png')}
        style={{ width: 150, height: 150, opacity }}
        resizeMode="contain"
      />
    </View>
  );
}
