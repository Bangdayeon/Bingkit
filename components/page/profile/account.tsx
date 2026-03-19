import IconButton from '@/components/common/IconButton';
import BackArrowIcon from '@/assets/icons/ic_arrow_back.svg';
import { useRouter } from 'expo-router';
import { Image, Pressable, View } from 'react-native';
import Text from '@/components/common/Text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface RowItemProps {
  label: string;
  onPress: () => void;
}

function RowItem({ label, onPress }: RowItemProps) {
  return (
    <Pressable onPress={onPress} className="flex-row items-center justify-between px-5 py-4">
      <Text className="text-title-sm">{label}</Text>
      <View style={{ transform: [{ rotate: '180deg' }] }}>
        <BackArrowIcon width={20} height={20} />
      </View>
    </Pressable>
  );
}

export default function AccountPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-white dark:bg-gray-900" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="h-[60px] flex-row items-center px-4 border-b border-gray-300 dark:border-gray-700">
        <IconButton
          variant="ghost"
          size={32}
          icon={<BackArrowIcon width={20} height={20} />}
          onClick={() => router.back()}
        />
        <Text className="flex-1 text-center text-title-sm">계정 관리</Text>
        <View className="w-8" />
      </View>

      {/* 연동 계정 정보 */}
      <View className="px-5 pt-6 pb-4">
        <Text className="text-title-sm mb-4">연동 계정 정보</Text>
        <View className="flex-row items-center gap-3">
          <View className="w-6 h-6 rounded-md bg-[#FEE500] items-center justify-center">
            <Image
              source={require('@/assets/icons/kakao_logo.png')}
              style={{ width: 14, height: 14 }}
              resizeMode="contain"
            />
          </View>
          <Text className="text-title-sm">카카오톡</Text>
          <Text className="text-title-sm text-gray-500 dark:text-gray-400 ml-auto">
            dfdsfdf@kakao.com
          </Text>
        </View>
      </View>

      <View className="h-px bg-gray-200 dark:bg-gray-700 mx-5 my-2" />

      <RowItem label="계정 초기화" onPress={() => {}} />
      <RowItem label="회원 탈퇴" onPress={() => {}} />
    </View>
  );
}
