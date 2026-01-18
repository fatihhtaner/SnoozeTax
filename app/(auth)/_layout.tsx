import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Stack } from 'expo-router';

export default function AuthLayout() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    return (
        <Stack
            screenOptions={{
                headerStyle: {
                    backgroundColor: theme.background,
                },
                headerTintColor: theme.text,
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
                contentStyle: {
                    backgroundColor: theme.background,
                },
            }}>
            <Stack.Screen name="login" options={{ title: 'Sign In', headerShown: false }} />
            <Stack.Screen name="sign-up" options={{ title: 'Create Account', headerBackTitle: 'Login' }} />
        </Stack>
    );
}
