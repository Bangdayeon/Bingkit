import { Pressable, View } from 'react-native';
import ForwardArrowIcon from '@/assets/icons/ic_arrow_forward.svg';
import { Text } from '@/components/Text';
import { Image, ImageSourcePropType } from 'react-native';

interface MenuItemProps {
  imgSrc?: ImageSourcePropType;
  label: string;
  onPress: () => void;
  rightText?: string;
  showArrow?: boolean;
}

export function MenuItem({ imgSrc, label, onPress, rightText, showArrow = false }: MenuItemProps) {
  const iconColor = '#181C1C'; /* gray-100 : gray-900 */
  return (
    <Pressable onPress={onPress} className="flex-row items-center justify-between py-4">
      <View className="flex-row gap-2 items-center">
        {imgSrc && <Image source={imgSrc} style={{ width: 20, height: 20 }} />}
        <Text className="text-title-sm">{label}</Text>
      </View>
      <View className="flex-row items-center gap-1">
        {rightText && <Text className="text-title-sm text-gray-500  ">{rightText}</Text>}
        {showArrow && <ForwardArrowIcon width={20} height={20} color={iconColor} />}
      </View>
    </Pressable>
  );
}
