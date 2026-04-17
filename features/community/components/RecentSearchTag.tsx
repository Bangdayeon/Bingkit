import { Pressable, View } from 'react-native';
import Animated, { FadeOutUp, LinearTransition } from 'react-native-reanimated';
import { Text } from '@/components/Text';

interface RecentSearchTagProps {
  label: string;
  onPress: () => void;
  onDelete: () => void;
}

export function RecentSearchTag({ label, onPress, onDelete }: RecentSearchTagProps) {
  return (
    <Animated.View layout={LinearTransition.duration(250)} exiting={FadeOutUp.duration(200)}>
      <View className="flex-row items-center h-7 px-3 rounded-full border border-gray-300   bg-white  ">
        <Pressable onPress={onPress} hitSlop={4}>
          <Text className="text-body-sm">{label}</Text>
        </Pressable>
        <Pressable onPress={onDelete} hitSlop={8} style={{ marginLeft: 4 }}>
          <Text style={{ color: '#929898' /* gray-500 */, fontSize: 16, lineHeight: 18 }}>×</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}
