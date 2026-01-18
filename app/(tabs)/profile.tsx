import { auth } from '@/config/firebaseConfig';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { router } from 'expo-router';
import { signOut } from 'firebase/auth';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ProfileScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const { userProfile } = useAuth();

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            router.replace('/(auth)/login');
        } catch (error) {
            Alert.alert('Error', 'Failed to sign out');
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Text style={[styles.title, { color: theme.text }]}>Profile</Text>
            <View style={[styles.separator, { backgroundColor: theme.border }]} />

            <View style={styles.info}>
                <Text style={[styles.label, { color: theme.icon }]}>Email</Text>
                <Text style={[styles.value, { color: theme.text }]}>{userProfile?.email}</Text>

                <Text style={[styles.label, { color: theme.icon, marginTop: 20 }]}>Display Name</Text>
                <Text style={[styles.value, { color: theme.text }]}>{userProfile?.displayName || 'User'}</Text>

                <Text style={[styles.label, { color: theme.icon, marginTop: 20 }]}>Wallet Balance</Text>
                <TouchableOpacity onPress={() => router.push('/wallet')}>
                    <Text style={[styles.value, { color: userProfile?.walletBalance && userProfile.walletBalance < 0 ? theme.error : theme.primary, textDecorationLine: 'underline' }]}>
                        ${userProfile?.walletBalance?.toFixed(2) || '0.00'}
                    </Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                style={[styles.button, { backgroundColor: theme.error }]}
                onPress={handleSignOut}>
                <Text style={styles.buttonText}>Sign Out</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        paddingTop: 50,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    separator: {
        marginVertical: 30,
        height: 1,
        width: '80%',
    },
    info: {
        width: '80%',
        marginBottom: 40,
    },
    label: {
        fontSize: 14,
        marginBottom: 4,
    },
    value: {
        fontSize: 18,
        fontWeight: '500',
    },
    button: {
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 8,
    },
    buttonText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
