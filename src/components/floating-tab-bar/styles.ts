import { StyleSheet } from 'react-native';

import { theme } from '@/theme';

export const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    borderRadius: theme.radius.pill,
    bottom: 18,
    flexDirection: 'row',
    height: 78,
    justifyContent: 'space-around',
    left: 18,
    paddingHorizontal: theme.spacing.sm,
    paddingBottom: 12,
    paddingTop: 10,
    position: 'absolute',
    right: 18,
    shadowColor: '#0D7A4F',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.18,
    shadowRadius: 28,
    elevation: 12,
  },
  item: {
    alignItems: 'center',
    flex: 1,
    gap: theme.spacing.xs,
  },
  pressedItem: {
    opacity: 0.72,
  },
  inactiveIcon: {
    alignItems: 'center',
    height: 34,
    justifyContent: 'center',
    width: 44,
  },
  activeIcon: {
    alignItems: 'center',
    borderRadius: theme.radius.pill,
    height: 52,
    justifyContent: 'center',
    marginTop: -28,
    width: 52,
  },
  badge: {
    alignItems: 'center',
    borderRadius: theme.radius.pill,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    paddingHorizontal: 5,
    position: 'absolute',
    right: 2,
    top: -2,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    lineHeight: 12,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
  },
});
