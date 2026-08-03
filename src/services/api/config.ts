import Constants from 'expo-constants';
import { Platform } from 'react-native';

function getHostFromUri(uri?: string | null) {
  if (!uri) {
    return undefined;
  }

  const withoutScheme = uri.replace(/^[a-z]+:\/\//i, '');
  const host = withoutScheme.split(/[/:]/)[0];

  return host || undefined;
}

function getExpoHostApiUrl() {
  const constants = Constants as typeof Constants & {
    manifest2?: {
      extra?: {
        expoClient?: {
          hostUri?: string;
        };
      };
    };
  };
  const host = getHostFromUri(
    Constants.expoConfig?.hostUri ?? constants.manifest2?.extra?.expoClient?.hostUri,
  );

  if (!host || host === 'localhost' || host === '127.0.0.1') {
    return undefined;
  }

  return `http://${host}:3000`;
}

const ANDROID_API_BASE_URL =
  process.env.EXPO_PUBLIC_ANDROID_API_URL ??
  getExpoHostApiUrl() ??
  process.env.EXPO_PUBLIC_API_URL ??
  'http://10.0.2.2:3000';

const DEFAULT_API_BASE_URL = Platform.select({
  android: ANDROID_API_BASE_URL,
  default: 'http://localhost:3000',
});

export const API_BASE_URL =
  Platform.OS === 'android'
    ? ANDROID_API_BASE_URL
    : process.env.EXPO_PUBLIC_API_URL ?? DEFAULT_API_BASE_URL;

export const API_TIMEOUT_MS = 15000;
