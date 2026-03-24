import { View } from 'react-native';

interface AvatarProps {
  size?: number;
}

export function Avatar({ size = 30 }: AvatarProps) {
  return (
    <View
      style={{ width: size, height: size, borderRadius: size / 2 }}
      className="bg-gray-300 border border-gray-300"
    />
  );
}
