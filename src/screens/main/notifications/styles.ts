import { StyleSheet } from 'react-native';

import { theme } from '@/theme';

export const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  backButton: {
    alignItems: 'center',
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  headerText: {
    flex: 1,
    gap: theme.spacing.xs,
    minWidth: 0,
  },
  listCard: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  notificationRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.md,
    minHeight: 82,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  avatarWrap: {
    position: 'relative',
  },
  typeIcon: {
    alignItems: 'center',
    borderRadius: theme.radius.pill,
    bottom: -2,
    height: 22,
    justifyContent: 'center',
    position: 'absolute',
    right: -4,
    width: 22,
  },
  notificationContent: {
    flex: 1,
    gap: theme.spacing.xxs,
    minWidth: 0,
  },
  notificationTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  unreadDot: {
    borderRadius: theme.radius.pill,
    height: 8,
    width: 8,
  },
  bold: {
    fontWeight: '700',
  },
});
