import { StyleSheet } from 'react-native';

import { theme } from '@/theme';

export const styles = StyleSheet.create({
  flex: { flex: 1 },

  // ─── Header ─────────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  headerText: {
    flex: 1,
    minWidth: 0,
  },
  nameRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.xs,
    minWidth: 0,
  },
  headerName: {
    fontWeight: '600',
    maxWidth: 180,
  },
  headerSpacer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
  },

  // ─── Message list ────────────────────────────────────────────────────────────
  messageList: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    flexGrow: 1,
  },

  // ─── Date separator ──────────────────────────────────────────────────────────
  dateSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  dateLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  dateLabel: {
    fontWeight: '500',
    textTransform: 'capitalize',
  },

  // ─── Message row ─────────────────────────────────────────────────────────────
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: theme.spacing.sm,
    marginVertical: theme.spacing.xxs,
  },
  messageRowReverse: {
    flexDirection: 'row-reverse',
  },
  avatarSlot: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },

  // ─── Bubbles ─────────────────────────────────────────────────────────────────
  bubble: {
    maxWidth: '75%',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  bubbleMe: {
    borderRadius: theme.radius.lg,
    borderBottomRightRadius: theme.radius.xs,
  },
  bubbleThem: {
    borderRadius: theme.radius.lg,
    borderBottomLeftRadius: theme.radius.xs,
    borderWidth: StyleSheet.hairlineWidth,
  },
  bubbleText: {
    lineHeight: 20,
  },
  timestamp: {
    alignSelf: 'flex-end',
    fontSize: 11,
    marginTop: 2,
    opacity: 0.75,
  },

  // ─── Typing indicator ────────────────────────────────────────────────────────
  typingRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.xs,
  },
  typingBubble: {
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.lg,
    borderBottomLeftRadius: theme.radius.xs,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
  },
  typingDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },

  // ─── Input bar ───────────────────────────────────────────────────────────────
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    gap: theme.spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  attachmentButton: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 32,
  },
  input: {
    flex: 1,
    fontFamily: theme.typography.font.inter.regular,
    maxHeight: 120,
    borderWidth: theme.borderWidths.sm,
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: 15,
    includeFontPadding: false,
    lineHeight: 20,
    minWidth: 0,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
