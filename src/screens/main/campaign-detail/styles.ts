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
    textAlign: 'center',
  },

  // Scroll content
  scroll: {
    padding: theme.spacing.lg,
    gap: theme.spacing.xl,
  },

  // Banner
  banner: {
    borderRadius: theme.radius.lg,
  },
  bannerBody: {
    gap: theme.spacing.sm,
  },
  bannerAmount: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: theme.spacing.xs,
  },
  bannerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
    gap: theme.spacing.md,
  },
  stat: {
    alignItems: 'center',
    gap: 2,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.3)',
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
    paddingTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  actionButton: {
    flex: 1,
  },
});
