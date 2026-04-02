import { Chip } from '@/components/Chip';
import Calendar from '@/assets/icons/ic_calendar.svg';
import { Pressable, View, useColorScheme } from 'react-native';
import { Text } from '@/components/Text';
import { Information } from '@/components/Information';

const DURATION_OPTIONS = ['1개월', '3개월', '6개월', '1년', '직접 지정'];

interface BingoGoalProps {
  selectedDuration: string | null;
  onDurationSelect: (opt: string) => void;
  startDate: Date | null;
  endDate: Date | null;
  isEndDateDisabled: boolean;
  onOpenStartPicker: () => void;
  onOpenEndPicker: () => void;
}

const formatDate = (date: Date | null) =>
  date
    ? `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
    : '';

export function BingoGoal({
  selectedDuration,
  onDurationSelect,
  startDate,
  endDate,
  isEndDateDisabled,
  onOpenStartPicker,
  onOpenEndPicker,
}: BingoGoalProps) {
  const colorScheme = useColorScheme();
  const iconColor = colorScheme === 'dark' ? '#F6F7F7' : '#181C1C'; /* gray-100 : gray-900 */
  return (
    <View className="px-5 pt-6 pb-5">
      <View className="flex-row items-center gap-2 mb-3">
        <Text className="text-title-md">목표 기간</Text>
        <Information content="처음 지정 후 수정이 불가능해요." />
      </View>
      <View className="flex-row flex-wrap gap-2">
        {DURATION_OPTIONS.map((opt) => (
          <Chip
            key={opt}
            label={opt}
            selected={selectedDuration === opt}
            onPress={() => onDurationSelect(opt)}
          />
        ))}
      </View>
      <View className="flex-row mt-4">
        <View className="w-1/2 pr-3">
          <Text className="text-body-lg mb-2">시작일</Text>
          <Pressable
            onPress={onOpenStartPicker}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              backgroundColor: '#F6F7F7' /* gray-100 */,
              borderRadius: 999,
              paddingHorizontal: 12,
              paddingVertical: 6,
            }}
          >
            <Calendar width={16} height={16} color={iconColor} />
            <Text className="text-body-sm text-gray-500">
              {formatDate(startDate) || '선택하기'}
            </Text>
          </Pressable>
        </View>
        <View className="w-1/2">
          <Text className="text-body-lg mb-2">종료일</Text>
          <Pressable
            onPress={!isEndDateDisabled ? onOpenEndPicker : undefined}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              backgroundColor: '#F6F7F7' /* gray-100 */,
              borderRadius: 999,
              paddingHorizontal: 12,
              paddingVertical: 6,
              opacity: isEndDateDisabled ? 0.5 : 1,
            }}
          >
            <Calendar width={16} height={16} color={iconColor} />
            <Text className="text-body-sm text-gray-500">{formatDate(endDate) || '선택하기'}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
