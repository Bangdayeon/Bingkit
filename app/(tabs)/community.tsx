import Text from '@/components/common/Text';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CommunityScreen() {
  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
      <Text className="text-xl font-bold">커뮤니티</Text>
    </SafeAreaView>
  );
}
