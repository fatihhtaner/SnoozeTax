import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
import { getAuth, getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Auth
// We attempt to initialize with React Native Persistence.
// If that fails (e.g. during certain dev reloads), we fall back to default getAuth().
let auth;

try {
    // @ts-ignore: getReactNativePersistence is valid in React Native context but types might lag
    auth = initializeAuth(app, {
        persistence: getReactNativePersistence(ReactNativeAsyncStorage)
    });
    console.log('[firebaseConfig] initializeAuth success');
} catch (e: any) {
    console.error('[firebaseConfig] initializeAuth failed, falling back to getAuth:', e);
    // If initializeAuth fails (e.g. "Auth instance already initialized"), get the existing instance
    auth = getAuth(app);
}

export { auth };
export const db = getFirestore(app);

// Config loaded
