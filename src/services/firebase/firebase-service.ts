import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { logger } from '@/services/logger';
import { notificationsService } from '@/services/notifications';
import type { SessionUser } from '@/navigation/session';

const firebaseLogger = logger.child('Firebase');
let backgroundHandlerConfigured = false;
let initialized = false;
let unsubscribeMessage: (() => void) | undefined;
let unsubscribeTokenRefresh: (() => void) | undefined;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

function isNativePlatform() {
  return Platform.OS === 'android' || Platform.OS === 'ios';
}

async function getMessaging() {
  if (!isNativePlatform()) {
    return null;
  }

  const messagingModule = await import('@react-native-firebase/messaging');
  return {
    instance: messagingModule.getMessaging(),
    module: messagingModule,
  };
}

async function getCrashlytics() {
  if (!isNativePlatform()) {
    return null;
  }

  const crashlyticsModule = await import('@react-native-firebase/crashlytics');
  return {
    instance: crashlyticsModule.getCrashlytics(),
    module: crashlyticsModule,
  };
}

async function requestNotificationPermission() {
  const expoPermission = await Notifications.requestPermissionsAsync();

  if (!expoPermission.granted) {
    firebaseLogger.warn('Push permission denied', {
      status: expoPermission.status,
    });
    return false;
  }

  const messaging = await getMessaging();

  if (!messaging) {
    return false;
  }

  if (Platform.OS === 'ios') {
    const status = await messaging.module.requestPermission(messaging.instance);
    return status === 1 || status === 2;
  }

  return true;
}

async function registerToken(authToken: string | null) {
  if (!authToken) {
    return;
  }

  const messaging = await getMessaging();

  if (!messaging) {
    return;
  }

  const granted = await requestNotificationPermission();

  if (!granted) {
    return;
  }

  await messaging.module.registerDeviceForRemoteMessages(messaging.instance);
  const token = await messaging.module.getToken(messaging.instance);

  await notificationsService.registerPushToken(
    {
      appVersion: Constants.expoConfig?.version,
      platform: Platform.OS === 'android' || Platform.OS === 'ios' ? Platform.OS : 'unknown',
      token,
    },
    authToken,
  );
  firebaseLogger.info('FCM token registered');
}

async function configureCrashlytics(user: SessionUser | null) {
  const crashlytics = await getCrashlytics();

  if (!crashlytics) {
    return;
  }

  await crashlytics.module.setCrashlyticsCollectionEnabled(crashlytics.instance, true);

  if (user) {
    await crashlytics.module.setUserId(crashlytics.instance, user.id);
    await crashlytics.module.setAttributes(crashlytics.instance, {
      email: user.email,
      name: user.name,
      preferredRole: user.preferredRole ?? '',
    });
  } else {
    await crashlytics.module.setUserId(crashlytics.instance, '');
  }
}

async function recordCrashlyticsError(error: unknown, context?: Record<string, string>) {
  const crashlytics = await getCrashlytics();

  if (!crashlytics) {
    return;
  }

  if (context) {
    await crashlytics.module.setAttributes(crashlytics.instance, context);
  }

  crashlytics.module.recordError(
    crashlytics.instance,
    error instanceof Error ? error : new Error(String(error)),
  );
}

async function configureBackgroundMessageHandler() {
  if (backgroundHandlerConfigured || !isNativePlatform()) {
    return;
  }

  backgroundHandlerConfigured = true;

  try {
    const messaging = await getMessaging();

    if (!messaging) {
      return;
    }

    messaging.module.setBackgroundMessageHandler(messaging.instance, async (message) => {
      firebaseLogger.info('Background push received', {
        messageId: message.messageId,
      });
    });
  } catch (error) {
    firebaseLogger.warn('Background push handler setup failed', {
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

async function initialize(authToken: string | null, user: SessionUser | null) {
  if (!isNativePlatform()) {
    return;
  }

  try {
    await configureCrashlytics(user);

    const messaging = await getMessaging();

    if (!messaging) {
      return;
    }

    if (!initialized) {
      unsubscribeMessage = messaging.module.onMessage(messaging.instance, async (message) => {
        firebaseLogger.info('Foreground push received', {
          messageId: message.messageId,
        });

        if (message.notification?.title || message.notification?.body) {
          await Notifications.scheduleNotificationAsync({
            content: {
              body: message.notification?.body,
              data: message.data ?? {},
              title: message.notification?.title,
            },
            trigger: null,
          });
        }
      });

      initialized = true;
    }

    await registerToken(authToken);

    unsubscribeTokenRefresh?.();
    unsubscribeTokenRefresh = messaging.module.onTokenRefresh(messaging.instance, async (token) => {
      if (!authToken) {
        return;
      }

      await notificationsService.registerPushToken(
        {
          appVersion: Constants.expoConfig?.version,
          platform: Platform.OS === 'android' || Platform.OS === 'ios' ? Platform.OS : 'unknown',
          token,
        },
        authToken,
      );
      firebaseLogger.info('FCM token refreshed');
    });
  } catch (error) {
    firebaseLogger.error('Firebase initialization failed', {
      message: error instanceof Error ? error.message : String(error),
    });
    await recordCrashlyticsError(error, { area: 'firebase_initialization' });
  }
}

function cleanup() {
  unsubscribeMessage?.();
  unsubscribeTokenRefresh?.();
  unsubscribeMessage = undefined;
  unsubscribeTokenRefresh = undefined;
  initialized = false;
}

export const firebaseService = {
  cleanup,
  initialize,
  recordCrashlyticsError,
};

void configureBackgroundMessageHandler();
