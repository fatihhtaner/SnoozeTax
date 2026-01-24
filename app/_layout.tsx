import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, LogBox, View } from 'react-native';
import 'react-native-reanimated';

// Ignore specific warnings
LogBox.ignoreLogs([
  'Expo AV has been deprecated',
]);

import { Colors } from '@/constants/Colors';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { LanguageProvider } from '@/context/LanguageContext';
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
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  const { hasSeenOnboarding } = useOnboarding();

  useEffect(() => {
    // Notification Listeners
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      const alarmId = response.notification.request.content.data.alarmId;
      if (alarmId && typeof alarmId === 'string') {
        router.push({ pathname: '/alarm/active', params: { alarmId } });
      }
    });

    const foregroundListener = Notifications.addNotificationReceivedListener(notification => {
      const alarmId = notification.request.content.data.alarmId;
      // Optionally navigate immediately if app is open
      if (alarmId && typeof alarmId === 'string') {
        router.push({ pathname: '/alarm/active', params: { alarmId } });
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
      router.replace(user ? '/(tabs)' : '/(auth)/login');
    } else if (hasSeenOnboarding && user && !inTabsGroup && !inAlarmGroup) {
      router.replace('/(tabs)');
    } else if (hasSeenOnboarding && !user && !inAuthGroup) {
      router.replace('/(auth)/login');
    }
  }, [user, loading, segments, hasSeenOnboarding]);

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
