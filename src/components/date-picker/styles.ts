import { StyleSheet } from 'react-native';

import { theme } from '@/theme';

export const styles = StyleSheet.create({
  root: {
    gap: theme.spacing.sm,
  },
  trigger: {
    alignItems: 'center',
    borderRadius: theme.radius.md,
    borderWidth: theme.borderWidths.sm,
    flexDirection: 'row',
    minHeight: 48,
    minWidth: 0,
    paddingHorizontal: theme.spacing.md,
  },
  input: {
    flex: 1,
    fontFamily: theme.typography.font.inter.regular,
    fontSize: theme.typography.size.md,
    includeFontPadding: false,
    lineHeight: theme.typography.lineHeight.md,
    minWidth: 0,
    paddingVertical: theme.spacing.sm,
  },
  calendarButton: {
    alignItems: 'center',
    borderRadius: theme.radius.pill,
    height: 34,
    justifyContent: 'center',
    marginLeft: theme.spacing.sm,
    width: 34,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  panel: {
    alignSelf: 'center',
    borderTopLeftRadius: theme.radius.lg,
    borderTopRightRadius: theme.radius.lg,
    gap: theme.spacing.lg,
    minHeight: 464,
    padding: theme.spacing.lg,
    width: '100%',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerControls: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  headerButton: {
    alignItems: 'center',
    borderRadius: theme.radius.pill,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  monthLabel: {
    flex: 1,
    textAlign: 'center',
  },
  week: {
    flexDirection: 'row',
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    minHeight: 252,
  },
  day: {
    alignItems: 'center',
    aspectRatio: 1,
    justifyContent: 'center',
    width: `${100 / 7}%`,
  },
  dayInner: {
    alignItems: 'center',
    borderRadius: theme.radius.pill,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    justifyContent: 'flex-end',
    marginTop: 'auto',
  },
  disabled: {
    opacity: 0.4,
  },
});
