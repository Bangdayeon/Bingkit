import { GoogleButton } from '@/features/auth/components/GoogleButton';
import { router } from 'expo-router';
import { Image, TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/Text';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <View className="flex-1 items-center justify-center">
        <Image
          source={require('../../assets/logoWithText_300.png')}
          style={{ width: 150, height: 200 }}
          resizeMode="contain"
        />
      </View>

      <View className="px-5 pb-8 gap-3">
        <TouchableOpacity className="w-full h-14 rounded-xl bg-kakao items-center justify-center">
          <Image
            source={require('../../assets/icons/kakao_logo.png')}
            style={{ width: 18, height: 18 }}
            className="absolute left-4"
            resizeMode="contain"
          />
          <Text className="text-base font-semibold">카카오로 시작하기</Text>
        </TouchableOpacity>

        <TouchableOpacity className="w-full h-14 rounded-xl bg-black items-center justify-center">
          <Image
            source={require('../../assets/icons/apple_logo.png')}
            style={{ width: 18, height: 18 }}
            className="absolute left-4"
            resizeMode="contain"
          />
          <Text className="text-white text-base font-semibold">Apple로 시작하기</Text>
        </TouchableOpacity>

        <GoogleButton />

        <TouchableOpacity
          className="w-full h-14 items-center justify-center"
          onPress={() => router.push('/onboarding')}
        >
          <Text className="text-gray-500 dark:text-gray-400 text-sm">로그인없이 시작하기</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
