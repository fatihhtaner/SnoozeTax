import { auth } from '@/config/firebaseConfig';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import {
    GoogleAuthProvider,
    OAuthProvider,
    signInWithCredential
} from 'firebase/auth';
import { Platform } from 'react-native';
import { UserService } from './UserService';

// Conditional import for Google Sign-In (not available in Expo Go)
let GoogleSignin: any = null;
try {
    const googleSigninModule = require('@react-native-google-signin/google-signin');
    GoogleSignin = googleSigninModule.GoogleSignin;
} catch (error) {
    console.warn('Google Sign-In not available in Expo Go. Use development build for Google Sign-In.');
}

export class SocialAuthService {
    /**
     * Initialize Google Sign-In configuration
     * Note: You need to add your Web Client ID from Firebase Console
     */
    static configureGoogleSignIn() {
        GoogleSignin.configure({
            webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '',
            offlineAccess: true,
        });
    }

    /**
     * Sign in with Google
     */
    static async signInWithGoogle(): Promise<void> {
        if (!GoogleSignin) {
            throw new Error('Google Sign-In is not available. Please use a development build.');
        }

        try {
            // Configure if not already done
            this.configureGoogleSignIn();

            // Check if device supports Google Play Services
            await GoogleSignin.hasPlayServices();

            // Get user info and ID token
            const userInfo = await GoogleSignin.signIn();

            if (!userInfo.data?.idToken) {
                throw new Error('No ID token received from Google');
            }

            // Create Firebase credential
            const credential = GoogleAuthProvider.credential(userInfo.data.idToken);

            // Sign in to Firebase
            const userCredential = await signInWithCredential(auth, credential);

            // Create or update user profile in Firestore
            const displayName = userInfo.data.user.name || userInfo.data.user.email?.split('@')[0] || 'User';
            const email = userInfo.data.user.email || '';

            await UserService.createUser(userCredential.user.uid, email, displayName);
        } catch (error: any) {
            console.error('Google Sign-In Error:', error);

            // Handle configuration errors specifically
            if (error.toString().includes('GoogleService-Info.plist') || error.toString().includes('clientID')) {
                throw new Error('Google Sign-In configuration missing. Please add GoogleService-Info.plist or configure Client IDs.');
            }

            throw error;
        }
    }

    /**
     * Sign in with Apple (iOS only)
     */
    static async signInWithApple(): Promise<void> {
        if (Platform.OS !== 'ios') {
            throw new Error('Apple Sign-In is only available on iOS');
        }

        try {
            // Generate nonce for security
            const nonce = Math.random().toString(36).substring(2, 10);
            const hashedNonce = await Crypto.digestStringAsync(
                Crypto.CryptoDigestAlgorithm.SHA256,
                nonce
            );

            // Request Apple credentials
            const appleCredential = await AppleAuthentication.signInAsync({
                requestedScopes: [
                    AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                    AppleAuthentication.AppleAuthenticationScope.EMAIL,
                ],
                nonce: hashedNonce,
            });

            if (!appleCredential.identityToken) {
                throw new Error('No identity token received from Apple');
            }

            // Create Firebase credential
            const provider = new OAuthProvider('apple.com');
            const credential = provider.credential({
                idToken: appleCredential.identityToken,
                rawNonce: nonce,
            });

            // Sign in to Firebase
            const userCredential = await signInWithCredential(auth, credential);

            // Create or update user profile
            // Note: Apple may not provide email/name on subsequent logins
            const displayName = appleCredential.fullName?.givenName
                ? `${appleCredential.fullName.givenName} ${appleCredential.fullName.familyName || ''}`.trim()
                : userCredential.user.email?.split('@')[0] || 'User';

            const email = appleCredential.email || userCredential.user.email || '';

            await UserService.createUser(userCredential.user.uid, email, displayName);
        } catch (error: any) {
            if (error.code === 'ERR_REQUEST_CANCELED') {
                // User canceled the sign-in flow
                throw new Error('Apple Sign-In was canceled');
            }
            console.error('Apple Sign-In Error:', error);
            throw error;
        }
    }

    /**
     * Check if Apple Sign-In is available on this device
     */
    static async isAppleSignInAvailable(): Promise<boolean> {
        if (Platform.OS !== 'ios') {
            return false;
        }
        return await AppleAuthentication.isAvailableAsync();
    }
}
