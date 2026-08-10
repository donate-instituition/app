import { StyleSheet } from 'react-native';

import { theme } from '@/theme';

export const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
  },
  header: {
    gap: theme.spacing.xs,
  },
  actionGrid: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  actionCard: {
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: theme.borderWidths.sm,
    flex: 1,
    gap: theme.spacing.xs,
    minHeight: 82,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
  },
  formCard: {
    gap: theme.spacing.lg,
    borderRadius: 20,
  },
  toast: {
    alignItems: 'flex-start',
    borderRadius: 18,
    borderWidth: theme.borderWidths.sm,
    flexDirection: 'row',
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
  },
  toastClose: {
    alignItems: 'center',
    borderRadius: theme.radius.pill,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  toastText: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  toastTitle: {
    fontWeight: '600',
  },
  blockingNotice: {
    alignItems: 'flex-start',
    borderRadius: 16,
    borderWidth: theme.borderWidths.sm,
    flexDirection: 'row',
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
  },
  noticeText: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  footerActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    width: '100%',
  },
  footerActionItem: {
    flex: 1,
    minWidth: 0,
  },
  stepper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stepItem: {
    alignItems: 'center',
    flex: 1,
    gap: theme.spacing.xs,
  },
  stepDot: {
    alignItems: 'center',
    borderRadius: theme.radius.pill,
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
  uploadBox: {
    alignItems: 'center',
    borderRadius: 18,
    borderStyle: 'dashed',
    borderWidth: theme.borderWidths.sm,
    gap: theme.spacing.xs,
    minHeight: 130,
    overflow: 'hidden',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  uploadOverlay: {
    alignItems: 'center',
    borderRadius: theme.radius.pill,
    bottom: theme.spacing.md,
    flexDirection: 'row',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    position: 'absolute',
    right: theme.spacing.md,
  },
  uploadPreview: {
    ...StyleSheet.absoluteFillObject,
  },
  textArea: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  splitRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  splitItem: {
    flex: 1,
  },
  reviewBox: {
    gap: theme.spacing.md,
  },
  reviewImage: {
    aspectRatio: 16 / 9,
    borderRadius: 16,
    width: '100%',
  },
  reviewRows: {
    gap: theme.spacing.sm,
  },
  reviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  reviewNotice: {
    alignItems: 'center',
    borderRadius: 16,
    flexDirection: 'row',
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  tagButton: {
    borderRadius: theme.radius.pill,
  },
});
