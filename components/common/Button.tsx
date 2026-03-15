import { ActivityIndicator, Text, TouchableOpacity, TouchableOpacityProps } from 'react-native';

type Variant = 'primary' | 'secondary' | 'dangerous';

interface ButtonProps extends Omit<TouchableOpacityProps, 'onPress'> {
  label: string;
  onClick: () => void;
  variant?: Variant;
  className?: string;
  loading?: boolean;
  disabled?: boolean;
}

const variantStyles: Record<Variant, { container: string; text: string }> = {
  primary: {
    container: 'bg-green-400',
    text: 'text-gray-900',
  },
  secondary: {
    container: 'bg-white border border-gray-200',
    text: 'text-gray-900',
  },
  dangerous: {
    container: 'bg-red-500',
    text: 'text-white',
  },
};

export default function Button({
  label,
  variant = 'primary',
  className = '',
  loading = false,
  disabled = false,
  onClick,
  ...rest
}: ButtonProps) {
  const { container, text } = variantStyles[variant];
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onClick}
      disabled={isDisabled}
      activeOpacity={0.8}
      className={`h-14 rounded-full items-center justify-center ${container} ${isDisabled ? 'opacity-40' : ''} ${className}`}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'secondary' ? '#181C1C' : '#ffffff'} />
      ) : (
        <Text className={`text-label-sm ${text}`}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}
