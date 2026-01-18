import { auth } from '@/config/firebaseConfig';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { UserService } from '@/services/UserService';
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function SignUpScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    const handleSignUp = async () => {
        if (!email || !password || !displayName) {
            Alert.alert('Error', 'Please fill in all fields.');
            return;
        }
        setLoading(true);
        try {
            // 1. Create Auth User
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            // 2. Create Firestore Profile
            await UserService.createUser(userCredential.user.uid, email, displayName);

            Alert.alert('Success', 'Account created successfully!');
            // Auth listener directs to main app
        } catch (error: any) {
            Alert.alert('Registration Failed', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.container, { backgroundColor: theme.background }]}>

            <View style={styles.form}>
                <Text style={[styles.label, { color: theme.text }]}>Full Name</Text>
                <TextInput
                    style={[styles.input, { color: theme.text, borderColor: theme.icon, backgroundColor: theme.background === '#0F2027' ? '#1A2E35' : '#FFFFFF' }]}
                    placeholder="John Doe"
                    placeholderTextColor={theme.icon}
                    value={displayName}
                    onChangeText={setDisplayName}
                />

                <Text style={[styles.label, { color: theme.text }]}>Email</Text>
                <TextInput
                    style={[styles.input, { color: theme.text, borderColor: theme.icon, backgroundColor: theme.background === '#0F2027' ? '#1A2E35' : '#FFFFFF' }]}
                    placeholder="hello@snoozetax.com"
                    placeholderTextColor={theme.icon}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />

                <Text style={[styles.label, { color: theme.text }]}>Password</Text>
                <TextInput
                    style={[styles.input, { color: theme.text, borderColor: theme.icon, backgroundColor: theme.background === '#0F2027' ? '#1A2E35' : '#FFFFFF' }]}
                    placeholder="******"
                    placeholderTextColor={theme.icon}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />

                <TouchableOpacity
                    style={[styles.button, { backgroundColor: theme.primary }]}
                    onPress={handleSignUp}
                    disabled={loading}>
                    {loading ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <Text style={styles.buttonText}>Create Account</Text>
                    )}
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
    },
    form: {
        width: '100%',
    },
    label: {
        marginBottom: 8,
        fontWeight: '600',
        fontSize: 14,
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 15,
        marginBottom: 20,
        fontSize: 16,
    },
    button: {
        height: 50,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '600',
    },
});
