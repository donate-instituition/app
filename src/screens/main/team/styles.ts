import { StyleSheet } from 'react-native';

import { theme } from '@/theme';

export const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.xl,
    paddingVertical: theme.spacing.xl,
  },
  header: {
    gap: theme.spacing.xs,
  },
  headerRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: theme.spacing.md,
    justifyContent: 'space-between',
  },
  headerText: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  list: {
    gap: theme.spacing.md,
  },
  member: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  memberInfo: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  memberMeta: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  form: {
    gap: theme.spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  flex: {
    flex: 1,
  },
  section: {
    gap: theme.spacing.md,
  },
  success: {
    gap: theme.spacing.xs,
  },
  error: {
    textAlign: 'center',
  },
});
