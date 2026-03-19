import { useRouter } from 'expo-router';
import { ScrollView, View } from 'react-native';
import Text from '@/components/common/Text';
import MenuItem from './MenuItem';

export default function ProfilePage() {
  const router = useRouter();

  return (
    <ScrollView className="flex-1 mt-[80px] bg-white px-5 dark:bg-gray-900">
      {/* 프로필 영역 */}
      <View className="flex-row items-start mb-5 gap-4 h-[100px]">
        <View className="w-[98px] h-[98px] rounded-xl bg-green-400 border border-gray-300 dark:border-gray-700" />
        <View className="flex-1 pt-1 flex flex-col justify-between h-full">
          <View>
            <Text className="text-title-sm text-gray900 mb-1">유저닉네임</Text>
            <Text className="text-body-md">user1028</Text>
          </View>
          <View className="flex-row gap-3 mb-2">
            <Text className="text-caption-md">피드 nn</Text>
            <Text className="text-caption-md">팔로워 nn</Text>
            <Text className="text-caption-md">팔로잉 nn</Text>
          </View>
        </View>
      </View>
      <View className="mb-3">
        <Text className="text-label-sm">한 줄 다짐</Text>
        <Text className="text-caption-md">한줄다짐 한줄다짐 한줄다짐 한줄다짐</Text>
      </View>

      <View className="h-px bg-gray-200 dark:bg-gray-700" />

      {/* 메뉴 - 화살표 있는 항목 */}
      <MenuItem label="프로필 편집" onPress={() => router.push('/profile-edit')} showArrow />
      <MenuItem label="계정 관리" onPress={() => router.push('/account')} showArrow />
      <MenuItem label="알림 설정" onPress={() => router.push('/alert-setting')} showArrow />
      <MenuItem label="제작자 설레게 하기" onPress={() => {}} showArrow />
      <MenuItem label="앱/아이콘 테마" onPress={() => router.push('/app-theme')} showArrow />

      <View className="h-px bg-gray-200 dark:bg-gray-700" />

      {/* 메뉴 - 화살표 없는 항목 */}
      <MenuItem label="자주 묻는 질문" onPress={() => {}} />
      <MenuItem label="버전 정보" onPress={() => {}} rightText="v 1.0.0" />
      <MenuItem label="이용 약관" onPress={() => {}} />
      <MenuItem label="개인정보 처리방침" onPress={() => {}} />

      <View className="h-px bg-gray-200 dark:bg-gray-700" />

      <MenuItem label="로그아웃" onPress={() => {}} />
    </ScrollView>
  );
}
