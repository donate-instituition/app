import { StyleSheet } from 'react-native';

import { theme } from '@/theme';

export const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    flex: 1,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.md,
    justifyContent: 'space-between',
  },
  iconButton: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  searchIcon: {
    paddingLeft: theme.spacing.md,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    minWidth: 0,
    paddingVertical: theme.spacing.md,
  },
  conversationContent: {
    flex: 1,
    gap: theme.spacing.xxs,
    minWidth: 0,
  },
  conversationHeader: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  conversationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  preview: {
    flex: 1,
    minWidth: 0,
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: theme.radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xs,
    flexShrink: 0,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  bold: {
    fontWeight: '600',
  },
  section: {
    gap: theme.spacing.md,
  },
});
