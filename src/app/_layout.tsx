import { ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/src/hooks/use-color-scheme';
import { AppNavigationThemes } from '@/src/navigation/theme';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const themeMode = colorScheme ?? 'light';

  return (
    <ThemeProvider value={AppNavigationThemes[themeMode]}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}
