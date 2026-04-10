import { TouchableOpacity, useWindowDimensions } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';

export function Dot({ active, onPress }: { active: boolean; onPress: () => void }) {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const dotHeight = isTablet ? 12 : 8;
  const dotActiveWidth = isTablet ? 30 : 20;
  const dotInactiveWidth = isTablet ? 12 : 8;

  const style = useAnimatedStyle(() => ({
    width: withSpring(active ? dotActiveWidth : dotInactiveWidth, {
      damping: 8,
      stiffness: 120,
      mass: 0.6,
    }),
    backgroundColor: withSpring(active ? '#8EF275' : '#D2D6D6', {
      damping: 10,
      stiffness: 100,
    }) /* green-400 : gray-300 */,
  }));

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Animated.View style={[{ height: dotHeight, borderRadius: dotHeight / 2 }, style]} />
    </TouchableOpacity>
  );
}
