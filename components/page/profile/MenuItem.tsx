import { Pressable, View, useColorScheme } from 'react-native';
import BackArrowIcon from '@/assets/icons/ic_arrow_back.svg';
import Text from '@/components/common/Text';

interface MenuItemProps {
  label: string;
  onPress: () => void;
  rightText?: string;
  showArrow?: boolean;
}

export default function MenuItem({ label, onPress, rightText, showArrow = false }: MenuItemProps) {
  const colorScheme = useColorScheme();
  const iconColor = colorScheme === 'dark' ? '#F6F7F7' : '#181C1C';
  return (
    <Pressable onPress={onPress} className="flex-row items-center justify-between py-4">
      <Text className="text-title-sm">{label}</Text>
      <View className="flex-row items-center gap-1">
        {rightText && (
          <Text className="text-title-sm text-gray-500 dark:text-gray-400">{rightText}</Text>
        )}
        {showArrow && (
          <View style={{ transform: [{ rotate: '180deg' }] }}>
            <BackArrowIcon width={20} height={20} color={iconColor} />
          </View>
        )}
      </View>
    </Pressable>
  );
}
