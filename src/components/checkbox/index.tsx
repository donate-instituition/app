import { Pressable, View, type PressableProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { theme } from '@/theme';

import { styles } from './styles';

type CheckboxProps = Omit<PressableProps, 'children' | 'onPress'> & {
  checked: boolean;
  label?: string;
  helperText?: string;
  onCheckedChange?: (checked: boolean) => void;
};

export function Checkbox({
  checked,
  disabled,
  helperText,
  label,
  onCheckedChange,
  style,
  ...props
}: CheckboxProps) {
  const scheme = useColorScheme() ?? 'light';
  const colors = theme.colors[scheme];

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: Boolean(checked), disabled: Boolean(disabled) }}
      disabled={disabled}
      onPress={() => onCheckedChange?.(!checked)}
      style={({ pressed }) => [
        styles.root,
        disabled ? styles.disabled : undefined,
        pressed ? { opacity: 0.84 } : undefined,
        typeof style === 'function' ? style({ pressed, hovered: false }) : style,
      ]}
      {...props}>
      <View
        style={[
          styles.box,
          {
            backgroundColor: checked ? colors.primary : colors.surface,
            borderColor: checked ? colors.primary : colors.border,
          },
        ]}>
        {checked ? <View style={[styles.checkedDot, { backgroundColor: colors.surface }]} /> : null}
      </View>
      {label || helperText ? (
        <View style={styles.content}>
          {label ? <ThemedText variant="body">{label}</ThemedText> : null}
          {helperText ? (
            <ThemedText variant="caption" color={colors.textMuted}>
              {helperText}
            </ThemedText>
          ) : null}
        </View>
      ) : null}
    </Pressable>
  );
}
