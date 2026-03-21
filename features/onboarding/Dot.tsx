import { TouchableOpacity } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';

export function Dot({ active, onPress }: { active: boolean; onPress: () => void }) {
  const style = useAnimatedStyle(() => ({
    width: withSpring(active ? 20 : 8, { damping: 8, stiffness: 120, mass: 0.6 }),
    backgroundColor: withSpring(active ? '#8EF275' : '#D2D6D6', {
      damping: 10,
      stiffness: 100,
    }) /* green-400 : gray-300 */,
  }));

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Animated.View style={[{ height: 8, borderRadius: 4 }, style]} />
    </TouchableOpacity>
  );
}
