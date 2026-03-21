import { View } from 'react-native';
import { Text } from '@/components/Text';
import { IconButton } from '@/components/IconButton';
import BackArrowIcon from '@/assets/icons/ic_arrow_back.svg';
import { useRouter } from 'expo-router';

export function BingoAddHeader({ onBack }: { onBack?: () => void }) {
  const router = useRouter();
  return (
    <View className="h-[60px] flex-row items-center border-b border-gray-300 dark:border-gray-700 px-4">
      <IconButton
        variant="ghost"
        icon={<BackArrowIcon width={20} height={20} />}
        onClick={onBack ?? (() => router.back())}
        size={32}
      />
      <Text className="flex-1 text-center text-title-sm">빙고 추가하기</Text>
      <View className="w-8" />
    </View>
  );
}
