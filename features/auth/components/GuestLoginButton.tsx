import { TouchableOpacity } from 'react-native';
import { Text } from '@/components/Text';
import { router } from 'expo-router';

export function GuestLoginButton() {
  return (
    <TouchableOpacity
      onPress={() => router.push('/(auth)/email-login')}
      className="w-full h-14 rounded-xl items-center justify-center"
    >
      <Text className="text-base font-semibold md:text-lg">이메일로 시작하기</Text>
    </TouchableOpacity>
  );
}
