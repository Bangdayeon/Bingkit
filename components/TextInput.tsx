import { forwardRef } from 'react';
import { TextInput as RNTextInput, TextInputProps, View } from 'react-native';

type Variant = 'default' | 'community';

interface Props extends TextInputProps {
  variant?: Variant;
  maxHeight?: number;
}

const variantStyles: Record<Variant, string> = {
  default: 'bg-gray-100 dark:bg-gray-800',
  community: 'bg-sky-100 dark:bg-sky-900',
};

export const TextInput = forwardRef<RNTextInput, Props>(function TextInput(
  { variant = 'default', maxHeight, className = '', style, ...rest },
  ref,
) {
  const hasMaxHeight = maxHeight !== undefined;
  return (
    <View
      className={`rounded-2xl px-4 ${hasMaxHeight ? 'justify-start py-2' : rest.multiline ? 'justify-start py-3' : 'justify-center h-9'} ${variantStyles[variant]} ${className}`}
      style={hasMaxHeight ? { maxHeight } : undefined}
    >
      <RNTextInput
        ref={ref}
        placeholderTextColor="#929898" /* gray-500 */
        className="text-body-sm text-gray-900 dark:text-gray-100"
        style={style}
        multiline={hasMaxHeight || rest.multiline}
        scrollEnabled={hasMaxHeight}
        {...rest}
      />
    </View>
  );
});
