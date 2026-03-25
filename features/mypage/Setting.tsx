import { useRouter } from 'expo-router';
import { ScrollView, View, Platform, Linking } from 'react-native';
import { Text } from '@/components/Text';
import { MenuItem } from './MenuItem';
import * as WebBrowser from 'expo-web-browser';

export function SettingPage() {
  const router = useRouter();
  const openUrl = async (url: string) => {
    await WebBrowser.openBrowserAsync(url);
  };

  // TODO: 이거 추가해야댐
  const ANDROID_PACKAGE_NAME = 'com.my.app';
  const IOS_APP_ID = '1234567890';

  const openReviewPage = async () => {
    try {
      if (Platform.OS === 'android') {
        const url = `market://details?id=${ANDROID_PACKAGE_NAME}`;
        const fallback = `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE_NAME}`;

        const supported = await Linking.canOpenURL(url);
        await Linking.openURL(supported ? url : fallback);
      } else {
        const url = `itms-apps://itunes.apple.com/app/id${IOS_APP_ID}?action=write-review`;
        await Linking.openURL(url);
      }
    } catch (error) {
      console.error('리뷰 페이지 이동 실패', error);
    }
  };

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
      <MenuItem
        label="👤 프로필 편집"
        onPress={() => router.push('/mypage/profile-edit')}
        showArrow
      />
      <MenuItem label="⚙️ 계정 관리" onPress={() => router.push('/mypage/account')} showArrow />
      <MenuItem
        label="🔔 알림 설정"
        onPress={() => router.push('/mypage/alert-setting')}
        showArrow
      />
      <MenuItem
        label="🎨 앱/아이콘 테마"
        onPress={() => router.push('/mypage/app-theme')}
        showArrow
      />

      <View className="h-px bg-gray-200 dark:bg-gray-700" />

      {/* 메뉴 - 화살표 없는 항목 */}
      <MenuItem label="👍 앱 리뷰하러 하기" onPress={openReviewPage} />
      <MenuItem
        label="❓ 자주 묻는 질문"
        onPress={() =>
          openUrl(
            'https://aback-shirt-867.notion.site/32eadd99c04280feb05bd33b3e011d0f?source=copy_link',
          )
        }
      />
      <MenuItem
        label="📝 이용 약관"
        onPress={() =>
          openUrl(
            'https://aback-shirt-867.notion.site/32eadd99c0428005b2e0e2437d6cd91a?source=copy_link',
          )
        }
      />
      <MenuItem
        label="🔐 개인정보 처리방침"
        onPress={() =>
          openUrl(
            'https://aback-shirt-867.notion.site/32eadd99c04280558920e3c684d4bd9a?source=copy_link',
          )
        }
      />
      <MenuItem
        label="♻️ 업데이트 내역"
        onPress={() =>
          openUrl(
            'https://aback-shirt-867.notion.site/32eadd99c04280b9843ded4a5c8f3fff?source=copy_link',
          )
        }
      />
      <MenuItem label="버전 정보" onPress={() => {}} rightText="v 1.0.0" />

      <View className="h-px bg-gray-200 dark:bg-gray-700" />

      <MenuItem label="로그아웃" onPress={() => {}} />
      <View className="h-40 bg-white" />
    </ScrollView>
  );
}
