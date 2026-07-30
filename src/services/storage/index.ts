/**
 * Persistent storage layer for the app.
 *
 * Currently backed by AsyncStorage (works with Expo Go and production builds).
 *
 * When you create a bare/dev build, you can swap this for react-native-mmkv
 * by replacing the import below — the Zustand store and all consumers
 * won't need any changes.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { StateStorage } from 'zustand/middleware';

export const persistStorage: StateStorage = {
  getItem: async (key) => {
    const value = await AsyncStorage.getItem(key);
    return value ?? null;
  },
  setItem: async (key, value) => {
    await AsyncStorage.setItem(key, value);
  },
  removeItem: async (key) => {
    await AsyncStorage.removeItem(key);
  },
};
