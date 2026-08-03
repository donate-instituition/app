import { StyleSheet } from 'react-native';

import { theme } from '@/theme';

export const styles = StyleSheet.create({
  flex: { flex: 1 },
  centered: { marginTop: theme.spacing['4xl'] },

  // Back bar / header
  backBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    minWidth: 0,
    textAlign: 'center',
  },

  // Scroll content
  scroll: {
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
  },

  cover: {
    alignItems: 'center',
    aspectRatio: 16 / 9,
    borderRadius: theme.radius.lg,
    justifyContent: 'center',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  organizerInline: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.sm,
    minWidth: 0,
  },
  progressMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  statPill: {
    alignItems: 'center',
    borderRadius: theme.radius.lg,
    flex: 1,
    padding: theme.spacing.md,
  },

  // Sections
  section: {
    gap: theme.spacing.md,
  },
  bold: {
    fontWeight: '600',
  },

  // Institution row
  institutionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  institutionInfo: {
    flex: 1,
    gap: theme.spacing.xxs,
    minWidth: 0,
  },

  // Items needed
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  itemChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
  },

  // Action bar
  actionBarSpacer: {
    height: 80,
  },
  actionBar: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    minWidth: 0,
    paddingTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  actionButton: {
    flex: 1,
  },
});
