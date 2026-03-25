import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, View, useColorScheme } from 'react-native';
import { Text } from '@/components/Text';
import DoneIcon from '@/assets/icons/ic_done.svg';
import DraftIcon from '@/assets/icons/ic_draft.svg';
import ProgressIcon from '@/assets/icons/ic_progress.svg';
import ForwardArrowIcon from '@/assets/icons/ic_arrow_forward.svg';
import { BingoState } from '@/types/bingo';
import { MOCK_BINGOS } from '@/mocks/bingo';

interface BingoItem {
  id: string;
  title: string;
}

const SECTION_ICONS = {
  draft: <DraftIcon />,
  progress: <ProgressIcon />,
  done: <DoneIcon color="#48BE30" /* green-600 */ />,
};

function Section({
  type,
  label,
  items,
  onItemPress,
}: {
  type: BingoState;
  label: string;
  items: BingoItem[];
  onItemPress: (item: BingoItem) => void;
}) {
  const colorScheme = useColorScheme();
  const iconColor = colorScheme === 'dark' ? '#F6F7F7' : '#181C1C'; /* gray-100 : gray-900 */

  return (
    <View className="mb-4">
      <View className="flex-row items-center gap-2 py-3">
        {SECTION_ICONS[type]}
        <Text className="text-title-md">{label}</Text>
      </View>
      {items.map((item) => (
        <Pressable
          key={item.id}
          onPress={() => onItemPress(item)}
          className="flex-row items-center justify-between py-3"
        >
          <Text className="text-title-sm">{item.title}</Text>
          <ForwardArrowIcon width={20} height={20} color={iconColor} />
        </Pressable>
      ))}
    </View>
  );
}

const MOCK_IN_PROGRESS: BingoItem[] = MOCK_BINGOS.filter((b) => b.state === 'progress').map(
  ({ id, title }) => ({ id, title }),
);

const MOCK_COMPLETED: BingoItem[] = MOCK_BINGOS.filter((b) => b.state === 'done').map(
  ({ id, title }) => ({ id, title }),
);

export function BingoHistory() {
  const router = useRouter();
  const [drafts, setDrafts] = useState<BingoItem[]>([]);

  const loadDraft = useCallback(() => {
    AsyncStorage.getItem('@bingket/draft-bingo').then((raw) => {
      if (!raw) {
        setDrafts([]);
        return;
      }
      const data = JSON.parse(raw);
      if (data?.title) setDrafts([{ id: 'draft_0', title: data.title }]);
      else setDrafts([]);
    });
  }, []);

  useFocusEffect(loadDraft);

  return (
    <ScrollView className="flex-1 mt-[80px] bg-white px-5 dark:bg-gray-900 mb-20">
      <Section
        type="draft"
        label="제작 중"
        items={drafts}
        onItemPress={() => router.push({ pathname: '/bingo/add', params: { loadDraft: 'true' } })}
      />
      <Section
        type="progress"
        label="진행 중"
        items={MOCK_IN_PROGRESS}
        onItemPress={() => router.push('/bingo/modify')}
      />
      <Section
        type="done"
        label="완료"
        items={MOCK_COMPLETED}
        onItemPress={(item) =>
          router.push({ pathname: '/bingo/view', params: { bingoId: item.id } })
        }
      />
    </ScrollView>
  );
}
