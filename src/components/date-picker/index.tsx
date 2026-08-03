import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Modal, Pressable, TextInput, View, type ViewProps } from 'react-native';

import { Button } from '@/components/button';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { theme } from '@/theme';

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
  const days = [
    ...Array.from({ length: blankDays }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => new Date(year, month, index + 1)),
  ];

  return [...days, ...Array.from({ length: 42 - days.length }, () => null)];
}

function formatDate(date?: Date | null) {
  if (!date) {
    return '';
  }

  return new Intl.DateTimeFormat('pt-BR').format(date);
}

function onlyDigits(value: string) {
  return value.replace(/\D/g, '');
}

function formatTypedDate(value: string) {
  return onlyDigits(value)
    .slice(0, 8)
    .replace(/(\d{2})(\d)/, '$1/$2')
    .replace(/(\d{2})(\d)/, '$1/$2');
}

function parseTypedDate(value: string) {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
    return null;
  }

  const [day, month, year] = value.split('/').map(Number);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
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
  const [typedValue, setTypedValue] = useState(formatDate(value));
  const scheme = useColorScheme() ?? 'light';
  const colors = theme.colors[scheme];
  const days = getCalendarDays(visibleMonth);

  useEffect(() => {
    setTypedValue(formatDate(value));
  }, [value]);

  function handleSelect(date: Date) {
    if (isDateDisabled(date, minDate, maxDate)) {
      return;
    }

    onChange?.(date);
    setTypedValue(formatDate(date));
    setOpen(false);
  }

  function handleTypedChange(nextValue: string) {
    const formatted = formatTypedDate(nextValue);
    const parsedDate = parseTypedDate(formatted);

    setTypedValue(formatted);

    if (parsedDate && !isDateDisabled(parsedDate, minDate, maxDate)) {
      setVisibleMonth(parsedDate);
      onChange?.(parsedDate);
    }
  }

  function changeMonth(amount: number) {
    setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + amount, 1));
  }

  function changeYear(amount: number) {
    setVisibleMonth((current) => new Date(current.getFullYear() + amount, current.getMonth(), 1));
  }

  return (
    <View style={[styles.root, disabled ? styles.disabled : undefined, style]} {...props}>
      {label ? <ThemedText variant="caption">{label}</ThemedText> : null}

      <Pressable
        disabled={disabled}
        style={[
          styles.trigger,
          {
            backgroundColor: colors.surface,
            borderColor: error ? colors.danger : colors.border,
          },
        ]}>
        <TextInput
          allowFontScaling={false}
          editable={!disabled}
          keyboardType="number-pad"
          maxLength={10}
          onChangeText={handleTypedChange}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          style={[styles.input, { color: colors.text }]}
          value={typedValue}
        />
        <Pressable
          accessibilityLabel="Abrir calendário"
          accessibilityRole="button"
          disabled={disabled}
          onPress={() => setOpen(true)}
          style={[styles.calendarButton, { backgroundColor: colors.primarySoft }]}>
          <Ionicons name="calendar-outline" size={18} color={colors.primary} />
        </Pressable>
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
              <View style={styles.headerControls}>
                <Pressable
                  accessibilityLabel="Ano anterior"
                  style={[styles.headerButton, { backgroundColor: colors.primarySoft }]}
                  onPress={() => changeYear(-1)}>
                  <Ionicons name="play-skip-back" size={16} color={colors.primary} />
                </Pressable>
                <Pressable
                  accessibilityLabel="Mês anterior"
                  style={[styles.headerButton, { backgroundColor: colors.surfaceMuted }]}
                  onPress={() => changeMonth(-1)}>
                  <Ionicons name="chevron-back" size={18} color={colors.primary} />
                </Pressable>
              </View>

              <ThemedText variant="subtitle" style={styles.monthLabel}>
                {formatMonth(visibleMonth)}
              </ThemedText>

              <View style={styles.headerControls}>
                <Pressable
                  accessibilityLabel="Próximo mês"
                  style={[styles.headerButton, { backgroundColor: colors.surfaceMuted }]}
                  onPress={() => changeMonth(1)}>
                  <Ionicons name="chevron-forward" size={18} color={colors.primary} />
                </Pressable>
                <Pressable
                  accessibilityLabel="Próximo ano"
                  style={[styles.headerButton, { backgroundColor: colors.primarySoft }]}
                  onPress={() => changeYear(1)}>
                  <Ionicons name="play-skip-forward" size={16} color={colors.primary} />
                </Pressable>
              </View>
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
