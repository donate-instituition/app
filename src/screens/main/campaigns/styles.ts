import { StyleSheet } from 'react-native';

import { theme } from '@/theme';

export const styles = StyleSheet.create({
  // Layout
  container: {
    gap: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
  },
  centered: {
    marginTop: theme.spacing['4xl'],
  },
  list: {
    gap: theme.spacing.sm,
  },

  // Search input icon
  searchIcon: {
    paddingLeft: theme.spacing.sm,
    paddingRight: theme.spacing.xs,
  },

  // Mode toggle (pill)
  modeToggle: {
    flexDirection: 'row',
    borderRadius: theme.radius.pill,
    padding: theme.spacing.xxs,
    gap: theme.spacing.xxs,
  },
  modeButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.pill,
  },
  modeButtonText: {
    textAlign: 'center',
  },
  modeButtonTextActive: {
    fontWeight: '600',
  },

  // Category filter chips
  categories: {
    gap: theme.spacing.sm,
    paddingBottom: theme.spacing.xs,
  },

  // Results counter
  results: {
    gap: theme.spacing.md,
  },

  // Campaign card internals
  campaignCard: {
    gap: theme.spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  goalRow: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
    alignItems: 'center',
  },

  // Institution card internals
  institutionCard: {
    gap: theme.spacing.sm,
  },
  institutionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  institutionFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.xs,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xxs,
  },

  // compat
  section: {
    gap: theme.spacing.md,
  },
});


