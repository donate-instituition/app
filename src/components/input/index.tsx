import { TextInput, type StyleProp, type TextInputProps, View, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { theme } from '@/theme';

import { getInputColors, styles, type InputVariant } from './styles';

type InputProps = TextInputProps & {
  label?: string;
  helperText?: string;
  error?: string;
  fieldStyle?: StyleProp<ViewStyle>;
  variant?: InputVariant;
  leftSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
};

type WebTextInputStyle = {
  caretColor?: string;
  outlineColor?: string;
};

export function Input({
  editable = true,
  error,
  fieldStyle,
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
  const webInputStyle: WebTextInputStyle = {
    caretColor: inputColors.textColor,
    outlineColor: 'transparent',
  };

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
          fieldStyle,
          {
            backgroundColor: inputColors.backgroundColor,
            borderColor: inputColors.borderColor,
          },
        ]}>
        {leftSlot}
        <TextInput
          allowFontScaling={false}
          editable={editable}
          placeholderTextColor={inputColors.placeholderColor}
          selectionColor={colors.primary}
          style={[
            styles.input,
            {
              backgroundColor: inputColors.backgroundColor,
              color: inputColors.textColor,
            },
            webInputStyle,
            style,
          ]}
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
