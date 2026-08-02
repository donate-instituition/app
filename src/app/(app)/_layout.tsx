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
      {/* Rotas legadas: mantidas só para redirecionar pelo perfil logado. */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

      {/* Áreas autenticadas por tipo de usuário. */}
      <Stack.Screen name="donor" options={{ headerShown: false }} />
      <Stack.Screen name="institution" options={{ headerShown: false }} />
      <Stack.Screen name="admin" options={{ headerShown: false }} />

      {/* Detalhes e fluxos compartilhados — empilhados sobre as tabs, sem tab bar. */}
      <Stack.Screen name="campaign/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="campaign/[id]/donate" options={{ headerShown: false }} />
      <Stack.Screen name="institution/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="chat/[conversationId]" options={{ headerShown: false }} />
    </Stack>
  );
}
