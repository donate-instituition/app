import { Pressable, View, type ViewProps } from 'react-native';

import { ThemedText } from '@/src/components/themed-text';
import { useColorScheme } from '@/src/hooks/use-color-scheme';
import { theme } from '@/src/theme';

import { styles } from './styles';

type RadioOption = {
  label: string;
  value: string;
  disabled?: boolean;
  description?: string;
};

type RadioGroupProps = ViewProps & {
  label?: string;
  options: RadioOption[];
  value?: string;
  onValueChange?: (value: string) => void;
};

export function RadioGroup({ label, onValueChange, options, style, value, ...props }: RadioGroupProps) {
  const scheme = useColorScheme() ?? 'light';
  const colors = theme.colors[scheme];

  return (
    <View style={[styles.root, style]} {...props}>
      {label ? <ThemedText variant="caption">{label}</ThemedText> : null}
      {options.map((option) => {
        const selected = option.value === value;

        return (
          <Pressable
            accessibilityRole="radio"
            accessibilityState={{ checked: selected, disabled: option.disabled }}
            disabled={option.disabled}
            key={option.value}
            onPress={() => onValueChange?.(option.value)}
            style={({ pressed }) => [
              styles.option,
              option.disabled ? styles.disabled : undefined,
              pressed ? { opacity: 0.84 } : undefined,
            ]}>
            <View
              style={[
                styles.indicator,
                {
                  borderColor: selected ? colors.primary : colors.border,
                },
              ]}>
              {selected ? (
                <View style={[styles.indicatorDot, { backgroundColor: colors.primary }]} />
              ) : null}
            </View>
            <View>
              <ThemedText variant="body">{option.label}</ThemedText>
              {option.description ? (
                <ThemedText variant="caption" color={colors.textMuted}>
                  {option.description}
                </ThemedText>
              ) : null}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
