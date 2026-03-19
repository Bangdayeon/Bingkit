import { Text as RNText, TextProps, useColorScheme } from 'react-native';

export default function Text({ style, className, ...props }: TextProps) {
  const colorScheme = useColorScheme();
  const defaultColorClass = colorScheme === 'dark' ? 'text-gray-100' : 'text-gray-900';

  return <RNText {...props} className={`${defaultColorClass} ${className ?? ''}`} style={style} />;
}
