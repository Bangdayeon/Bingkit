import { HeaderTabBar } from '@/components/HeaderTabbar';
import { BingoHistory } from '@/features/bingo/BingoHistory';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BingoAll } from '@/features/bingo/BingoAll';

export default function HomeScreen() {
  const [tabIndex, setTabIndex] = useState(0);

  return (
    <SafeAreaView className="relative flex-1 bg-white dark:bg-gray-900">
      <HeaderTabBar menus={['전체', '기록']} onTabChange={setTabIndex} />
      {tabIndex === 0 ? (
        // 전체 빙고 페이지
        <BingoAll />
      ) : (
        <BingoHistory />
      )}
    </SafeAreaView>
  );
}
