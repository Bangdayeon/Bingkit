import { Text as RNText, TextProps, useColorScheme } from 'react-native';
import { twMerge } from 'tailwind-merge';

export function Text({ style, className, ...props }: TextProps) {
  const colorScheme = useColorScheme();
  const defaultColorClass = colorScheme === 'dark' ? 'text-gray-100' : 'text-gray-900';

  return <RNText {...props} className={twMerge(defaultColorClass, className)} style={style} />;
}
