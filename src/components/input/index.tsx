import { TextInput, type TextInputProps, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { theme } from '@/theme';

import { getInputColors, styles, type InputVariant } from './styles';

type InputProps = TextInputProps & {
  label?: string;
  helperText?: string;
  error?: string;
  variant?: InputVariant;
  leftSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
};

export function Input({
  editable = true,
  error,
  helperText,
  label,
  leftSlot,
  rightSlot,
  style,
  variant = 'outline',
  ...props
}: InputProps) {
  const scheme = useColorScheme() ?? 'light';
  const colors = theme.colors[scheme];
  const inputColors = getInputColors(colors, variant, Boolean(error));

  return (
    <View style={[styles.root, editable ? undefined : styles.disabled]}>
      {label ? (
        <ThemedText variant="caption" color={inputColors.labelColor}>
          {label}
        </ThemedText>
      ) : null}

      <View
        style={[
          styles.field,
          {
            backgroundColor: inputColors.backgroundColor,
            borderColor: inputColors.borderColor,
          },
        ]}>
        {leftSlot}
        <TextInput
          editable={editable}
          placeholderTextColor={inputColors.placeholderColor}
          style={[styles.input, { color: inputColors.textColor }, style]}
          {...props}
        />
        {rightSlot}
      </View>

      {error || helperText ? (
        <ThemedText variant="caption" color={inputColors.helperColor}>
          {error ?? helperText}
        </ThemedText>
      ) : null}
    </View>
  );
}
