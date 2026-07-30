import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';

import { chatService, subscribeUnreadChanges } from '@/services/chat';

/**
 * Returns the total unread message count and keeps it in sync when the user
 * reads conversations or navigates back to the tab bar.
 */
export function useChatUnread(): number {
  const [count, setCount] = useState(() => chatService.getTotalUnread());

  const refresh = useCallback(() => {
    setCount(chatService.getTotalUnread());
  }, []);

  useEffect(() => subscribeUnreadChanges(refresh), [refresh]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  return count;
}
