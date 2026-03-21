import { useEffect, useRef } from 'react';
import { Animated, Pressable } from 'react-native';

interface ToggleProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
}

export function Toggle({ value, onValueChange }: ToggleProps) {
  const anim = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: value ? 1 : 0,
      duration: 180,
      useNativeDriver: false,
    }).start();
  }, [value]);

  const translateX = anim.interpolate({ inputRange: [0, 1], outputRange: [3, 29] });
  const bgColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#D2D6D6', '#8EF275'],
  }); /* gray-300 : green-400 */

  return (
    <Pressable onPress={() => onValueChange(!value)}>
      <Animated.View
        style={{
          width: 59,
          height: 30,
          borderRadius: 999,
          backgroundColor: bgColor,
          justifyContent: 'center',
        }}
      >
        <Animated.View
          style={{
            width: 24,
            height: 24,
            borderRadius: 99,
            backgroundColor: '#FDFDFD' /* white */,
            transform: [{ translateX }],
          }}
        />
      </Animated.View>
    </Pressable>
  );
}
