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

    const timer = setTimeout(() => {
      router.replace('/login');
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View className="flex-1 w-full h-full items-center justify-center bg-white">
      <Animated.Image
        source={require('../assets/logo_300.png')}
        style={{ width: 150, height: 150, opacity }}
        resizeMode="contain"
      />
    </View>
  );
}
