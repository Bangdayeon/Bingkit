import { Text as RNText, TextProps, useColorScheme } from 'react-native';

export default function Text({ style, ...props }: TextProps) {
  const colorScheme = useColorScheme();
  const defaultColor = colorScheme === 'dark' ? '#F6F7F7' : '#181C1C';

  return <RNText {...props} style={[{ color: defaultColor }, style]} />;
}
