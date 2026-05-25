import { ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AppNavigationThemes } from '@/navigation/theme';

// Warnings gerados por dependências internas do Expo/React Navigation que ainda
// referenciam SafeAreaView do react-native. Nosso código já usa o correto
// (react-native-safe-area-context) em todos os componentes.
LogBox.ignoreLogs(['SafeAreaView has been deprecated']);

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const themeMode = colorScheme ?? 'light';

  return (
    <SafeAreaProvider>
      <ThemeProvider value={AppNavigationThemes[themeMode]}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(app)" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
