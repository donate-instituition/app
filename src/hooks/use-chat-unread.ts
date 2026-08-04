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

  const refreshFromApi = useCallback(() => {
    void chatService
      .listConversations(authToken)
      .then(() => setCount(chatService.getTotalUnread()))
      .catch(() => setCount(chatService.getTotalUnread()));
  }, [authToken]);

  useEffect(() => subscribeUnreadChanges(refresh), [refresh]);

  useFocusEffect(
    useCallback(() => {
      refreshFromApi();
    }, [refreshFromApi])
  );

  return count;
}
