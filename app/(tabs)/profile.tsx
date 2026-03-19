import BadgesPage from '@/components/page/profile/badges';
import ProfilePage from '@/components/page/profile/profile';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import HeaderTabBar from '@/components/common/HeaderTabbar';

export default function ProfileScreen() {
  const [tabIndex, setTabIndex] = useState(0);

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <HeaderTabBar menus={['내 정보', '뱃지']} onTabChange={setTabIndex} />
      {tabIndex === 0 ? <ProfilePage /> : <BadgesPage />}
    </SafeAreaView>
  );
}
