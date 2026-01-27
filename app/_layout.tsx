import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { ActivityIndicator, LogBox, View } from 'react-native';
import 'react-native-reanimated';

import { AlarmService } from '@/services/AlarmService';
import { NotificationService } from '@/services/NotificationService';

// Ignore specific warnings
LogBox.ignoreLogs([
  'Expo AV has been deprecated',
]);

import { Colors } from '@/constants/Colors';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { LanguageProvider, useLanguage } from '@/context/LanguageContext';
import { OnboardingProvider, useOnboarding } from '@/context/OnboardingContext';
import { ToastProvider } from '@/context/ToastContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

const MorningLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.light.primary,
    background: Colors.light.background,
    text: Colors.light.text,
    card: Colors.light.background,
    border: Colors.light.secondary,
  },
};

const MorningDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: Colors.dark.primary,
    background: Colors.dark.background,
    text: Colors.dark.text,
    card: Colors.dark.background,
    border: Colors.dark.secondary,
  },
};

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { user, loading, isGuest } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const { locale, t } = useLanguage();

  const { hasSeenOnboarding } = useOnboarding();

  // Listen for language changes to update notifications
  useEffect(() => {
    const updateNotifications = async () => {
      if (user) {
        try {
          console.log('[RootLayout] Updating notifications for locale:', locale);
          const alarms = await AlarmService.getUserAlarms(user.uid);
          const activeAlarms = alarms.filter(a => a.isActive);

          // Update category actions with localized strings
          await NotificationService.setupNotificationCategories(
            t('snooze') || 'Snooze',
            t('im_up') || "I'm Up"
          );

          for (const alarm of activeAlarms) {
            // Skip recurring alarms for now as they serve a different logic or handled differently
            // But if your scheduleAlarm handles dates properly, we just re-schedule.
            // Note: If alarm is in the past, scheduleAlarm moves it to tomorrow. This is fine for quick logic.

            // We need to ensure we don't accidentally move a future alarm to further future if logic is "if past add day"
            // But here we are passing the stored time. If stored time is today 8 AM and it's 10 AM, scheduleAlarm uses tomorrow 8 AM.
            // This is correct behavior for a simple daily alarm.

            if (alarm.id) {
              await NotificationService.scheduleAlarm(
                alarm.id,
                t('wake_up') || 'Wake Up!',
                alarm.label || t('time_to_get_up') || 'Time to get up!',
                alarm.time.toDate(),
                alarm.sound || 'default'
              );
            }
          }
        } catch (error) {
          console.error("Failed to update notifications for language change", error);
        }
      }
    };

    // Defer slighty to allow translations to load if needed, though t() is usually synchronous
    if (user) {
      updateNotifications();
    }
  }, [locale, user]);

  // Track if user is currently on alarm screen to prevent duplicate navigation
  const isOnAlarmScreenRef = useRef(false);

  useEffect(() => {
    // Update ref based on current route
    const currentPath = segments.join('/');
    const isOnAlarmScreen = currentPath.includes('alarm/active');
    isOnAlarmScreenRef.current = isOnAlarmScreen;
    console.log('[AlarmScreen] Route changed:', currentPath, 'isOnAlarmScreen:', isOnAlarmScreen);
  }, [segments]);

  useEffect(() => {
    // Notification Listeners
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      const alarmId = response.notification.request.content.data.alarmId;
      const actionId = response.actionIdentifier;

      // Handle simple tap OR explicit action buttons
      if (alarmId && typeof alarmId === 'string') {
        // If they tapped "Snooze" or "I'm Up", we can pass that intent
        // For now, we just route to active alarm, and they can tap the big button there.
        // This is safer for ensuring they actually engage with the UI (and pay if needed).
        // You could pass ?action=snooze to auto-trigger, but let's just open for now.

        const data = response.notification.request.content.data as any;
        const { penaltyAmount, sound, label } = data;

        console.log(`[Notification] Action: ${actionId}, Alarm: ${alarmId}`);
        isOnAlarmScreenRef.current = true;
        router.push({
          pathname: '/alarm/active',
          params: { alarmId, penaltyAmount, sound, label }
        });
      }
    });

    const foregroundListener = Notifications.addNotificationReceivedListener(notification => {
      const alarmId = notification.request.content.data.alarmId;
      // Only navigate if user is NOT already on the alarm screen
      if (alarmId && typeof alarmId === 'string') {
        // Don't navigate if already on alarm/active screen
        if (!isOnAlarmScreenRef.current) {
          const data = notification.request.content.data as any;
          const { penaltyAmount, sound, label } = data;
          console.log('[Notification] Navigating to alarm screen');
          isOnAlarmScreenRef.current = true;
          router.push({
            pathname: '/alarm/active',
            params: { alarmId, penaltyAmount, sound, label }
          });
        } else {
          console.log('[Notification] Already on alarm screen, skipping navigation');
        }
      }
    });

    // Handle cold starts (app launched from killed state by tapping notification)
    Notifications.getLastNotificationResponseAsync().then(response => {
      if (response) {
        const alarmId = response.notification.request.content.data.alarmId;
        if (alarmId && typeof alarmId === 'string') {
          // Small delay to ensure navigation is ready
          setTimeout(() => {
            const data = response.notification.request.content.data as any;
            const { penaltyAmount, sound, label } = data;
            isOnAlarmScreenRef.current = true;
            router.push({
              pathname: '/alarm/active',
              params: { alarmId, penaltyAmount, sound, label }
            });
          }, 500);
        }
      }
    });

    return () => {
      responseListener.remove();
      foregroundListener.remove();
    };
  }, []);

  useEffect(() => {
    if (loading || hasSeenOnboarding === null) return;

    // ... (existing routing logic)
    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)';
    const inAlarmGroup = segments[0] === 'alarm';
    const inOnboarding = segments[0] === 'onboarding';

    if (!hasSeenOnboarding && !inOnboarding) {
      router.replace('/onboarding');
    } else if (hasSeenOnboarding && inOnboarding) {
      router.replace((user || isGuest) ? '/(tabs)' : '/(auth)/login');
    } else if (hasSeenOnboarding && (user || isGuest) && !inTabsGroup && !inAlarmGroup) {
      router.replace('/(tabs)');
    } else if (hasSeenOnboarding && !user && !isGuest && !inAuthGroup) {
      router.replace('/(auth)/login');
    }
  }, [user, isGuest, loading, segments, hasSeenOnboarding]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors[colorScheme ?? 'light'].background }}>
        <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].primary} />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? MorningDarkTheme : MorningLightTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="alarm/active" options={{ headerShown: false }} />
        <Stack.Screen name="alarm/editor" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false, gestureEnabled: false }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <OnboardingProvider>
          <ToastProvider>
            <RootLayoutNav />
          </ToastProvider>
        </OnboardingProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
