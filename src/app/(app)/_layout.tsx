import { Redirect, Stack } from 'expo-router';
import { useEffect, useState } from 'react';

import { routes } from '@/navigation/routes';
import { termsService } from '@/services/terms';
import { useAppStore } from '@/store';

export default function AppLayout() {
  const authToken = useAppStore((state) => state.authToken);
  const user = useAppStore((state) => state.user);
  const [termsChecked, setTermsChecked] = useState(false);
  const [requiresTermsAcceptance, setRequiresTermsAcceptance] = useState(false);

  useEffect(() => {
    let mounted = true;

    if (!authToken || !user) {
      setTermsChecked(true);
      setRequiresTermsAcceptance(false);
      return;
    }

    setTermsChecked(false);
    termsService
      .getCurrentTerm()
      .then((term) => {
        if (!mounted) return;
        setRequiresTermsAcceptance(!user.termsAccepted || user.acceptedTermsVersion !== term.version);
      })
      .catch(() => {
        if (!mounted) return;
        setRequiresTermsAcceptance(false);
      })
      .finally(() => {
        if (mounted) setTermsChecked(true);
      });

    return () => {
      mounted = false;
    };
  }, [authToken, user]);

  if (!authToken || !user) {
    return <Redirect href={routes.authLogin} />;
  }

  if (!termsChecked) {
    return null;
  }

  if (requiresTermsAcceptance) {
    return <Redirect href={routes.authTermsAccept} />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Áreas autenticadas por tipo de usuário. */}
      <Stack.Screen name="(tabs)/dashboard" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)/campaigns" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)/donations" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)/messages" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)/profile" options={{ headerShown: false }} />
      <Stack.Screen name="donor/(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="institution/(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="admin/(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="admin/audit/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="admin/user/[id]" options={{ headerShown: false }} />

      {/* Detalhes e fluxos compartilhados — empilhados sobre as tabs, sem tab bar. */}
      <Stack.Screen name="campaign/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="campaign/[id]/donate" options={{ headerShown: false }} />
      <Stack.Screen name="donation/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="institution/donations" options={{ headerShown: false }} />
      <Stack.Screen name="institution/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="chat/[conversationId]" options={{ headerShown: false }} />
      <Stack.Screen name="notifications" options={{ headerShown: false }} />
      <Stack.Screen name="profile/me" options={{ headerShown: false }} />
      <Stack.Screen name="profile/notifications" options={{ headerShown: false }} />
      <Stack.Screen name="profile/privacy" options={{ headerShown: false }} />
      <Stack.Screen name="profile/help" options={{ headerShown: false }} />
      <Stack.Screen name="profile/settings" options={{ headerShown: false }} />
      <Stack.Screen name="profile/supports" options={{ headerShown: false }} />
    </Stack>
  );
}
