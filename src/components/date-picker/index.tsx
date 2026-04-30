import { useState } from 'react';
import { Modal, Pressable, View, type ViewProps } from 'react-native';

import { Button } from '@/src/components/button';
import { ThemedText } from '@/src/components/themed-text';
import { useColorScheme } from '@/src/hooks/use-color-scheme';
import { theme } from '@/src/theme';

import { styles } from './styles';

type DatePickerProps = ViewProps & {
  label?: string;
  value?: Date | null;
  placeholder?: string;
  helperText?: string;
  error?: string;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  onChange?: (date: Date) => void;
};

const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isSameDay(a?: Date | null, b?: Date | null) {
  return Boolean(
    a &&
      b &&
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
  );
}

function isDateDisabled(date: Date, minDate?: Date, maxDate?: Date) {
  const normalizedDate = startOfDay(date).getTime();

  if (minDate && normalizedDate < startOfDay(minDate).getTime()) {
    return true;
  }

  if (maxDate && normalizedDate > startOfDay(maxDate).getTime()) {
    return true;
  }

  return false;
}

function getCalendarDays(monthDate: Date) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const blankDays = firstDay.getDay();

  return [
    ...Array.from({ length: blankDays }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => new Date(year, month, index + 1)),
  ];
}

function formatDate(date?: Date | null) {
  if (!date) {
    return '';
  }

  return new Intl.DateTimeFormat('pt-BR').format(date);
}

function formatMonth(date: Date) {
  return new Intl.DateTimeFormat('pt-BR', {
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function DatePicker({
  disabled,
  error,
  helperText,
  label,
  maxDate,
  minDate,
  onChange,
  placeholder = 'Selecione uma data',
  style,
  value,
  ...props
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(value ?? new Date());
  const scheme = useColorScheme() ?? 'light';
  const colors = theme.colors[scheme];
  const days = getCalendarDays(visibleMonth);

  function handleSelect(date: Date) {
    if (isDateDisabled(date, minDate, maxDate)) {
      return;
    }

    onChange?.(date);
    setOpen(false);
  }

  function changeMonth(amount: number) {
    setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + amount, 1));
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
        <ThemedText variant="body" color={value ? colors.text : colors.textMuted}>
          {formatDate(value) || placeholder}
        </ThemedText>
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
          <Pressable style={[styles.panel, { backgroundColor: colors.surface }]}>
            <View style={styles.header}>
              <Pressable style={styles.headerButton} onPress={() => changeMonth(-1)}>
                <ThemedText variant="body" color={colors.primary}>
                  Anterior
                </ThemedText>
              </Pressable>
              <ThemedText variant="subtitle">{formatMonth(visibleMonth)}</ThemedText>
              <Pressable style={styles.headerButton} onPress={() => changeMonth(1)}>
                <ThemedText variant="body" color={colors.primary}>
                  Proximo
                </ThemedText>
              </Pressable>
            </View>

            <View style={styles.week}>
              {weekDays.map((day, index) => (
                <ThemedText key={`${day}-${index}`} variant="caption" color={colors.textMuted} style={styles.weekDay}>
                  {day}
                </ThemedText>
              ))}
            </View>

            <View style={styles.grid}>
              {days.map((date, index) => {
                const selected = isSameDay(date, value);
                const unavailable = date ? isDateDisabled(date, minDate, maxDate) : true;

                return (
                  <Pressable
                    disabled={!date || unavailable}
                    key={date?.toISOString() ?? `empty-${index}`}
                    onPress={() => date && handleSelect(date)}
                    style={styles.day}>
                    {date ? (
                      <View
                        style={[
                          styles.dayInner,
                          selected ? { backgroundColor: colors.primary } : undefined,
                          unavailable ? styles.disabled : undefined,
                        ]}>
                        <ThemedText
                          variant="body"
                          color={selected ? colors.surface : colors.text}>
                          {String(date.getDate())}
                        </ThemedText>
                      </View>
                    ) : null}
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.actions}>
              <Button variant="ghost" onPress={() => setOpen(false)}>
                Cancelar
              </Button>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
