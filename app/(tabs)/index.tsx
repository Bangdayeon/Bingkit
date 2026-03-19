import HeaderTabBar from '@/components/common/HeaderTabbar';
import RecordTab from '@/components/page/home/RecordTab';
import BingoCard, { BingoData } from '@/components/page/home/BingoCard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import Text from '@/components/common/Text';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AddIcon from '@/assets/icons/ic_add.svg';

const MOCK_BINGOS: BingoData[] = [
  {
    id: '1',
    title: '2026',
    grid: '3x3',
    cells: Array(9).fill('어쩌구 저쩌구\n이런저런거 하기'),
    maxEdits: 3,
    achievedCount: 0,
    bingoCount: 0,
    dday: 365,
  },
  {
    id: '2',
    title: '버킷리스트',
    grid: '3x3',
    cells: Array(9).fill('어쩌구 저쩌구\n이런저런거 하기'),
    maxEdits: 3,
    achievedCount: 2,
    bingoCount: 1,
    dday: 180,
  },
];

const MAX_BINGOS = 3;

function calcDday(endDate: string | null): number {
  if (!endDate) return 0;
  const diff = new Date(endDate).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [tabIndex, setTabIndex] = useState(0);
  const [draftBingo, setDraftBingo] = useState<BingoData | null>(null);

  // HeaderTabBar는 absolute top-0 이고 내부에 paddingTop: insets.top + 탭 콘텐츠(54px)
  const headerHeight = insets.top + 54;

  const loadDraft = useCallback(() => {
    AsyncStorage.getItem('bingo_draft').then((raw) => {
      if (!raw) {
        setDraftBingo(null);
        return;
      }
      const data = JSON.parse(raw);
      if (!data?.title) {
        setDraftBingo(null);
        return;
      }
      const grid = data.selectedGrid ?? '3x3';
      const [cols, rows] = grid.split('x').map(Number);
      setDraftBingo({
        id: 'draft_0',
        title: data.title,
        grid,
        cells: data.cells ?? Array(cols * rows).fill(''),
        maxEdits: parseInt(data.selectedEditCount) || 3,
        achievedCount: 0,
        bingoCount: 0,
        dday: calcDday(data.endDate),
      });
    });
  }, []);

  useFocusEffect(loadDraft);

  const bingos: BingoData[] = [...(draftBingo ? [draftBingo] : []), ...MOCK_BINGOS].slice(
    0,
    MAX_BINGOS,
  );

  return (
    <SafeAreaView className="relative flex-1 bg-white dark:bg-gray-900">
      <HeaderTabBar menus={['전체', '기록']} onTabChange={setTabIndex} />
      {tabIndex === 0 ? (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 20, paddingTop: 80, paddingBottom: 40 }}
        >
          {bingos.map((bingo) => (
            <BingoCard
              key={bingo.id}
              bingo={bingo}
              onPress={() => {
                // TODO: 빙고 상세 페이지로 이동
              }}
              onEditPress={() =>
                bingo.id === 'draft_0'
                  ? router.push({ pathname: '/bingo-add', params: { loadDraft: 'true' } })
                  : router.push({ pathname: '/bingo-modify', params: { bingoId: bingo.id } })
              }
            />
          ))}

          {/* 새 빙고 추가 섹션 */}
          {bingos.length < MAX_BINGOS && (
            <Pressable
              onPress={() => router.push('/bingo-add')}
              className="items-center justify-center gap-3 bg-green-100 w-full h-[230px] rounded-[20px] mt-2"
            >
              <AddIcon width={40} height={40} />
              <Text className="text-title-md text-gray-700">
                ({bingos.length}/{MAX_BINGOS})
              </Text>
            </Pressable>
          )}
        </ScrollView>
      ) : (
        <View className="flex-1" style={{ paddingTop: headerHeight }}>
          <RecordTab />
        </View>
      )}
    </SafeAreaView>
  );
}
