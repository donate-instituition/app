import { ActivityIndicator, Pressable, type PressableProps, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { theme } from '@/theme';

import { getButtonColors, styles, type ButtonSize, type ButtonVariant } from './styles';

type ButtonProps = Omit<PressableProps, 'children'> & {
  children: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  leftSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
};

export function Button({
  children,
  disabled,
  fullWidth,
  leftSlot,
  loading,
  rightSlot,
  size = 'md',
  style,
  variant = 'primary',
  ...props
}: ButtonProps) {
  const scheme = useColorScheme() ?? 'light';
  const colors = theme.colors[scheme];
  const buttonColors = getButtonColors(colors, variant, disabled || loading);

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.root,
        styles[size],
        fullWidth ? styles.fullWidth : undefined,
        {
          backgroundColor: buttonColors.backgroundColor,
          borderColor: buttonColors.borderColor,
        },
        pressed ? styles.pressed : undefined,
        disabled ? styles.disabled : undefined,
        typeof style === 'function' ? style({ pressed, hovered: false }) : style,
      ]}
      {...props}>
      <View style={styles.content}>
        {loading ? <ActivityIndicator color={buttonColors.loaderColor} /> : leftSlot}
        <ThemedText variant="body" color={buttonColors.textColor}>
          {children}
        </ThemedText>
        {rightSlot}
      </View>
    </Pressable>
  );
}
