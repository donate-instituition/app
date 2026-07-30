import { Redirect, Stack } from 'expo-router';

import { routes } from '@/navigation/routes';
import { useAppStore } from '@/store';

export default function AppLayout() {
  const authToken = useAppStore((state) => state.authToken);
  const user = useAppStore((state) => state.user);

  if (!authToken || !user) {
    return <Redirect href={routes.authLogin} />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Tabs — tela base */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

      {/* Detalhes e fluxos — empilhados sobre as tabs, sem tab bar */}
      <Stack.Screen name="campaign/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="campaign/[id]/donate" options={{ headerShown: false }} />
      <Stack.Screen name="institution/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="chat/[conversationId]" options={{ headerShown: false }} />
    </Stack>
  );
}
