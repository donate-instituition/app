import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import type { StateStorage } from 'zustand/middleware';

const memoryStorage = new Map<string, string>();
const usesSecureStore = Platform.OS !== 'web';

async function removeLegacyPlaintextValue(key: string) {
  await AsyncStorage.removeItem(key);
}

export const persistStorage: StateStorage = {
  getItem: async (key) => {
    if (!usesSecureStore) {
      await removeLegacyPlaintextValue(key);
      return memoryStorage.get(key) ?? null;
    }

    const value = await SecureStore.getItemAsync(key);
    await removeLegacyPlaintextValue(key);

    return value ?? null;
  },
  setItem: async (key, value) => {
    if (!usesSecureStore) {
      memoryStorage.set(key, value);
      await removeLegacyPlaintextValue(key);
      return;
    }

    await SecureStore.setItemAsync(key, value);
    await removeLegacyPlaintextValue(key);
  },
  removeItem: async (key) => {
    if (!usesSecureStore) {
      memoryStorage.delete(key);
      await removeLegacyPlaintextValue(key);
      return;
    }

    await SecureStore.deleteItemAsync(key);
    await removeLegacyPlaintextValue(key);
  },
};
