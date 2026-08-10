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

function getEnvValue(key: string) {
  const value = process.env[key]?.trim();
  return value || undefined;
}

type AppEnvironment = 'local' | 'development' | 'preview' | 'production';

function getAppEnvironment(): AppEnvironment {
  const rawValue = getEnvValue('EXPO_PUBLIC_APP_ENV')?.toLowerCase();

  if (rawValue === 'prod') {
    return 'production';
  }

  if (rawValue === 'dev') {
    return 'development';
  }

  if (
    rawValue === 'local' ||
    rawValue === 'development' ||
    rawValue === 'preview' ||
    rawValue === 'production'
  ) {
    return rawValue;
  }

  return __DEV__ ? 'development' : 'production';
}

export const APP_ENV = getAppEnvironment();

const CONFIGURED_API_BASE_URL = getEnvValue('EXPO_PUBLIC_API_URL');

const ANDROID_API_BASE_URL =
  APP_ENV === 'production'
    ? CONFIGURED_API_BASE_URL
    : getExpoHostApiUrl() ??
      getEnvValue('EXPO_PUBLIC_ANDROID_API_URL') ??
      CONFIGURED_API_BASE_URL ??
      'http://10.0.2.2:3000';

const DEFAULT_API_BASE_URL = Platform.select({
  android: ANDROID_API_BASE_URL,
  default: 'http://localhost:3000',
});

if (APP_ENV === 'production' && !CONFIGURED_API_BASE_URL) {
  throw new Error('EXPO_PUBLIC_API_URL is required for production builds.');
}

export const API_BASE_URL =
  Platform.OS === 'android'
    ? (ANDROID_API_BASE_URL ?? DEFAULT_API_BASE_URL)
    : CONFIGURED_API_BASE_URL ?? DEFAULT_API_BASE_URL;

export const API_TIMEOUT_MS = 15000;
