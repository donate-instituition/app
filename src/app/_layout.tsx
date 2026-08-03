import { ThemeProvider } from '@react-navigation/native';
import { StripeProvider } from '@stripe/stripe-react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { LogBox, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AppNavigationThemes } from '@/navigation/theme';
import { useAppStore } from '@/store';

const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '';

// Warnings gerados por dependências internas do Expo/React Navigation que ainda
// referenciam SafeAreaView do react-native. Nosso código já usa o correto
// (react-native-safe-area-context) em todos os componentes.
LogBox.ignoreLogs(['SafeAreaView has been deprecated']);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Don't retry on 4xx errors — show the error to the user immediately
      retry: (failureCount, error) => {
        if (error instanceof Error && error.message.includes('4')) return false;
        return failureCount < 2;
      },
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const themeMode = colorScheme ?? 'light';
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  // AsyncStorage hydration is async — start false, flip to true when done.
  // Prevents routing before the persisted session is loaded, avoiding
  // a flash of the login screen for already-authenticated users.
  const [hydrated, setHydrated] = useState(useAppStore.persist.hasHydrated());

  useEffect(() => {
    if (hydrated) return;
    const unsub = useAppStore.persist.onFinishHydration(() => setHydrated(true));
    // Handle the race where hydration finished before this effect ran
    if (useAppStore.persist.hasHydrated()) setHydrated(true);
    return unsub;
  }, [hydrated]);

  if (!hydrated || !fontsLoaded) {
    // Blank screen while AsyncStorage loads — typically < 100ms
    return <View style={{ flex: 1 }} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <StripeProvider
        publishableKey={STRIPE_PUBLISHABLE_KEY || 'pk_test_missing'}
        urlScheme="elodoar">
        <SafeAreaProvider>
          <ThemeProvider value={AppNavigationThemes[themeMode]}>
            <Stack>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="terms" options={{ headerShown: false }} />
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="(app)" options={{ headerShown: false }} />
            </Stack>
            <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} />
          </ThemeProvider>
        </SafeAreaProvider>
      </StripeProvider>
    </QueryClientProvider>
  );
}
