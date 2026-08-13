import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';

import { chatService, subscribeUnreadChanges } from '@/services/chat';
import { useAppStore } from '@/store';

/**
 * Returns the total unread message count and keeps it in sync when the user
 * reads conversations or navigates back to the tab bar.
 */
export function useChatUnread(): number {
  const authToken = useAppStore((state) => state.authToken);
  const [count, setCount] = useState(() => chatService.getTotalUnread());

  const refresh = useCallback(() => {
    setCount(chatService.getTotalUnread());
  }, []);

  // Connect the socket and fetch conversations on mount to start receiving events immediately
  useEffect(() => {
    if (authToken) {
      chatService.connect(authToken);
      void chatService
        .listConversations(authToken)
        .then(() => setCount(chatService.getTotalUnread()))
        .catch(() => {});
    }
  }, [authToken]);

  // Subscribe to unread changes so badge updates in real-time
  useEffect(() => subscribeUnreadChanges(refresh), [refresh]);

  // Also refresh from API when the tab regains focus
  useFocusEffect(
    useCallback(() => {
      if (authToken) {
        void chatService
          .listConversations(authToken)
          .then(() => setCount(chatService.getTotalUnread()))
          .catch(() => {});
      }
    }, [authToken])
  );

  return count;
}
