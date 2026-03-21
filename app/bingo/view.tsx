import { BingoCard } from '@/features/bingo/components/BingoCard';
import { MOCK_BINGOS } from '@/mocks/bingo';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconButton } from '@/components/IconButton';
import BackArrowIcon from '@/assets/icons/ic_arrow_back.svg';
import { Text } from '@/components/Text';

export default function BingoViewScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { bingoId } = useLocalSearchParams<{ bingoId: string }>();

  const bingo = MOCK_BINGOS.find((b) => b.id === bingoId);

  if (!bingo) return null;

  const completedCells = Array(bingo.cells.length).fill(true);

  return (
    <View className="flex-1 bg-white dark:bg-gray-900" style={{ paddingTop: insets.top }}>
      <View className="h-[60px] flex-row items-center px-4 border-b border-gray-200 dark:border-gray-800">
        <IconButton
          variant="ghost"
          size={32}
          icon={<BackArrowIcon width={20} height={20} />}
          onClick={() => router.back()}
        />
        <Text className="flex-1 text-center text-title-sm">완료된 빙고</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingTop: 20, paddingBottom: insets.bottom + 40 }}
      >
        <BingoCard bingo={bingo} completedCells={completedCells} onCellPress={() => {}} />
      </ScrollView>
    </View>
  );
}
