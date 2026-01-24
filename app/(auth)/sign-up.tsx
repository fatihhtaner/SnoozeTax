import GradientBackground from '@/components/GradientBackground';
import { auth } from '@/config/firebaseConfig';
import { Colors } from '@/constants/Colors';
import { useLanguage } from '@/context/LanguageContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { SocialAuthService } from '@/services/SocialAuthService';
import { UserService } from '@/services/UserService';
import { getErrorMessage } from '@/utils/errorHandling';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, Stack, useRouter } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SignUpScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [displayName, setDisplayName] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [appleLoading, setAppleLoading] = useState(false);
    const router = useRouter();
    const { t } = useLanguage();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    const handleSignUp = async () => {
        if (!email || !password || !confirmPassword || !displayName) {
            setError(t('fill_all_fields'));
            return;
        }

        if (password !== confirmPassword) {
            setError(t('password_mismatch'));
            return;
        }
        setError(null);
        setLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await UserService.createUser(userCredential.user.uid, email, displayName);
            Alert.alert(t('success'), t('account_created'));
        } catch (error: any) {
            setError(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setError(null);
        setGoogleLoading(true);
        try {
            await SocialAuthService.signInWithGoogle();
        } catch (error: any) {
            console.error(error);
            setError(getErrorMessage(error));
        } finally {
            setGoogleLoading(false);
        }
    };

    const handleAppleSignIn = async () => {
        setError(null);
        setAppleLoading(true);
        try {
            await SocialAuthService.signInWithApple();
        } catch (error: any) {
            if (error.message !== 'Apple Sign-In was canceled') {
                console.error(error);
                setError(getErrorMessage(error));
            }
        } finally {
            setAppleLoading(false);
        }
    };

    return (
        <GradientBackground>
            <Stack.Screen options={{ headerShown: false }} />
            <SafeAreaView style={styles.container}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardView}>
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled">

                        {/* Logo/Title Section */}
                        <View style={styles.header}>
                            <Image
                                source={require('@/assets/images/logo.png')}
                                style={styles.logo}
                                resizeMode="contain"
                            />
                            <Text style={styles.tagline}>{t('sign_up')}</Text>
                        </View>

                        {/* Glassmorphism Card */}
                        <View style={styles.card}>
                            <TextInput
                                style={styles.input}
                                placeholder={t('full_name')}
                                placeholderTextColor="rgba(255, 255, 255, 0.6)"
                                value={displayName}
                                onChangeText={(text) => { setDisplayName(text); setError(null); }}
                                autoCapitalize="words"
                            />
                            <TextInput
                                style={styles.input}
                                placeholder={t('email')}
                                placeholderTextColor="rgba(255, 255, 255, 0.6)"
                                value={email}
                                onChangeText={(text) => { setEmail(text); setError(null); }}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                            <View style={styles.passwordContainer}>
                                <TextInput
                                    style={styles.passwordInput}
                                    placeholder={t('password')}
                                    placeholderTextColor="rgba(255, 255, 255, 0.6)"
                                    value={password}
                                    onChangeText={(text) => { setPassword(text); setError(null); }}
                                    secureTextEntry={!showPassword}
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                                    <FontAwesome name={showPassword ? "eye" : "eye-slash"} size={20} color="rgba(255, 255, 255, 0.6)" />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.passwordContainer}>
                                <TextInput
                                    style={styles.passwordInput}
                                    placeholder={t('confirm_password')}
                                    placeholderTextColor="rgba(255, 255, 255, 0.6)"
                                    value={confirmPassword}
                                    onChangeText={(text) => { setConfirmPassword(text); setError(null); }}
                                    secureTextEntry={!showConfirmPassword}
                                />
                                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                                    <FontAwesome name={showConfirmPassword ? "eye" : "eye-slash"} size={20} color="rgba(255, 255, 255, 0.6)" />
                                </TouchableOpacity>
                            </View>

                            {error && (
                                <View style={styles.errorContainer}>
                                    <FontAwesome name="exclamation-circle" size={14} color="#FF6B6B" style={{ marginRight: 6 }} />
                                    <Text style={styles.errorText}>{error}</Text>
                                </View>
                            )}

                            <TouchableOpacity
                                style={styles.button}
                                onPress={handleSignUp}
                                disabled={loading}>
                                <LinearGradient
                                    colors={['#2EC4B6', '#CBF3F0']}
                                    style={styles.gradientButton}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}>
                                    {loading ? (
                                        <ActivityIndicator color="#0F2027" />
                                    ) : (
                                        <Text style={styles.buttonText}>{t('sign_up')}</Text>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>

                            {/* OR Divider */}
                            <View style={styles.dividerContainer}>
                                <View style={styles.divider} />
                                <Text style={styles.dividerText}>{t('or_divider')}</Text>
                                <View style={styles.divider} />
                            </View>

                            {/* Google Sign-In - Only in development build */}
                            {__DEV__ && (
                                <TouchableOpacity
                                    style={styles.socialButton}
                                    onPress={handleGoogleSignIn}
                                    disabled={googleLoading || loading}>
                                    {googleLoading ? (
                                        <ActivityIndicator color="#4285F4" />
                                    ) : (
                                        <>
                                            <FontAwesome name="google" size={20} color="#4285F4" style={{ marginRight: 10 }} />
                                            <Text style={styles.socialButtonText}>{t('continue_with_google')}</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            )}

                            {/* Apple Sign-In (iOS only) */}
                            {Platform.OS === 'ios' && (
                                <TouchableOpacity
                                    style={[styles.socialButton, { backgroundColor: '#000' }]}
                                    onPress={handleAppleSignIn}
                                    disabled={appleLoading || loading}>
                                    {appleLoading ? (
                                        <ActivityIndicator color="#FFF" />
                                    ) : (
                                        <>
                                            <FontAwesome name="apple" size={20} color="#FFF" style={{ marginRight: 10 }} />
                                            <Text style={[styles.socialButtonText, { color: '#FFF' }]}>{t('continue_with_apple')}</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* Footer */}
                        <View style={styles.footer}>
                            <Text style={styles.footerText}>{t('already_have_account')} </Text>
                            <Link href="/(auth)/login" asChild>
                                <TouchableOpacity>
                                    <Text style={styles.footerLink}>{t('sign_in')}</Text>
                                </TouchableOpacity>
                            </Link>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </GradientBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logo: {
        width: '80%',
        height: 100,
        maxWidth: 500,
        marginBottom: 24,
    },
    tagline: {
        fontSize: 18,
        color: 'rgba(255, 255, 255, 0.9)',
        marginTop: 8,
        fontWeight: '300',
    },
    card: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 24,
        padding: 24,
        backdropFilter: 'blur(10px)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    input: {
        height: 56,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        borderRadius: 16,
        paddingHorizontal: 20,
        marginBottom: 16,
        fontSize: 16,
        color: '#FFFFFF',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    passwordContainer: {
        height: 56,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        borderRadius: 16,
        paddingHorizontal: 20,
        marginBottom: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        flexDirection: 'row',
        alignItems: 'center',
    },
    passwordInput: {
        flex: 1,
        height: '100%',
        fontSize: 16,
        color: '#FFFFFF',
    },
    eyeIcon: {
        marginLeft: 10,
    },
    button: {
        marginTop: 8,
        marginBottom: 16,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#2EC4B6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    gradientButton: {
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        color: '#0F2027',
        fontSize: 18,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 24,
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
    },
    dividerText: {
        marginHorizontal: 16,
        fontSize: 14,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.7)',
    },
    socialButton: {
        height: 56,
        borderRadius: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    socialButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 32,
    },
    footerText: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 15,
    },
    footerLink: {
        color: '#CBF3F0',
        fontWeight: 'bold',
        fontSize: 15,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 107, 107, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255, 107, 107, 0.3)',
        padding: 12,
        borderRadius: 12,
        marginBottom: 16,
    },
    errorText: {
        color: '#FF6B6B',
        fontSize: 14,
        flex: 1,
    },
});
