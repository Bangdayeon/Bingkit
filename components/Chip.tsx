import { Pressable } from 'react-native';
import { Text } from './Text';

interface ChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

export function Chip({ label, selected, onPress }: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      className={`h-7 px-3 rounded-full items-center justify-center border ${
        selected
          ? 'bg-green-400 border-green-500'
          : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700'
      }`}
    >
      <Text className={`text-caption-md ${selected ? 'font-semibold' : ''}`}>{label}</Text>
    </Pressable>
  );
}
