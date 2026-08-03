import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Pressable, View, type ViewProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { theme } from '@/theme';

import { styles } from './styles';

type SelectOption = {
  label: string;
  value: string;
  disabled?: boolean;
};

type SelectProps = ViewProps & {
  label?: string;
  placeholder?: string;
  value?: string;
  options: SelectOption[];
  error?: string;
  helperText?: string;
  disabled?: boolean;
  onValueChange?: (value: string) => void;
};

export function Select({
  disabled,
  error,
  helperText,
  label,
  onValueChange,
  options,
  placeholder = 'Selecione',
  style,
  value,
  ...props
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const scheme = useColorScheme() ?? 'light';
  const colors = theme.colors[scheme];
  const selectedOption = options.find((option) => option.value === value);

  function handleSelect(nextValue: string) {
    onValueChange?.(nextValue);
    setOpen(false);
  }

  return (
    <View style={[styles.root, disabled ? styles.disabled : undefined, style]} {...props}>
      {label ? <ThemedText variant="caption">{label}</ThemedText> : null}

      <Pressable
        accessibilityRole="button"
        disabled={disabled}
        onPress={() => setOpen(true)}
        style={[
          styles.trigger,
          {
            backgroundColor: colors.surface,
            borderColor: error ? colors.danger : colors.border,
          },
        ]}>
        <View style={styles.triggerContent}>
          <ThemedText
            variant="body"
            color={selectedOption ? colors.text : colors.textMuted}
            numberOfLines={1}
            style={styles.triggerLabel}>
            {selectedOption?.label ?? placeholder}
          </ThemedText>
          <Ionicons
            name={open ? 'chevron-up-outline' : 'chevron-down-outline'}
            size={18}
            color={colors.icon}
          />
        </View>
      </Pressable>

      {error || helperText ? (
        <ThemedText variant="caption" color={error ? colors.danger : colors.textMuted}>
          {error ?? helperText}
        </ThemedText>
      ) : null}

      <Modal transparent animationType="slide" visible={open} onRequestClose={() => setOpen(false)}>
        <Pressable
          style={[styles.modalBackdrop, { backgroundColor: 'rgba(0, 0, 0, 0.32)' }]}
          onPress={() => setOpen(false)}>
          <Pressable style={[styles.modalPanel, { backgroundColor: colors.surface }]}>
            {options.map((option) => {
              const selected = option.value === value;

              return (
                <Pressable
                  disabled={option.disabled}
                  key={option.value}
                  onPress={() => handleSelect(option.value)}
                  style={[
                    styles.option,
                    selected ? { backgroundColor: colors.primarySoft } : undefined,
                    option.disabled ? styles.disabled : undefined,
                  ]}>
                  <ThemedText
                    variant="body"
                    color={selected ? colors.primaryStrong : colors.text}>
                    {option.label}
                  </ThemedText>
                </Pressable>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
