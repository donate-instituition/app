import { StyleSheet } from 'react-native';

import { theme } from '@/theme';

export const PRESET_AMOUNTS = [1000, 2500, 5000, 10000, 25000]; // in cents

export const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    gap: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
  },

  // ─── Back bar ─────────────────────────────────────────────────────────────
  backBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  backButton: {
    padding: theme.spacing.sm,
    marginRight: theme.spacing.sm,
  },

  // ─── Campaign summary card ─────────────────────────────────────────────────
  summaryCard: {
    gap: theme.spacing.sm,
  },
  progressRow: {
    gap: theme.spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  // ─── Amount section ───────────────────────────────────────────────────────
  section: {
    gap: theme.spacing.md,
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  presetChip: {
    flex: 1,
    minWidth: '30%',
    borderWidth: theme.borderWidths.sm,
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  customPrefix: {
    minWidth: 28,
  },
  customInput: {
    flex: 1,
  },

  // ─── Total display ────────────────────────────────────────────────────────
  totalCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.spacing.md,
  },

  // ─── Success state ────────────────────────────────────────────────────────
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.xl,
    paddingHorizontal: theme.spacing.xl,
  },
  successIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successText: {
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  successActions: {
    width: '100%',
    gap: theme.spacing.md,
  },
  centered: {
    textAlign: 'center',
  },
});
