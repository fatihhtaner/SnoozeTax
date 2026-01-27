import { auth, db } from '@/config/firebaseConfig';
import { UserService } from '@/services/UserService';
import { User } from '@/types/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User as FirebaseUser, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
    user: FirebaseUser | null;
    userProfile: User | null;
    loading: boolean;
    isGuest: boolean;
    loginAsGuest: () => Promise<void>;
    logout: () => Promise<void>;
    refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    userProfile: null,
    loading: true,
    isGuest: false,
    loginAsGuest: async () => { },
    logout: async () => { },
    refreshUserProfile: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<FirebaseUser | null>(null);
    const [userProfile, setUserProfile] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isGuest, setIsGuest] = useState(false);

    // Load guest state from storage on mount
    useEffect(() => {
        const loadGuestState = async () => {
            try {
                const guestState = await AsyncStorage.getItem('is_guest');
                if (guestState === 'true') {
                    setIsGuest(true);
                }
            } catch (e) {
                console.error('Failed to load guest state', e);
            }
        };
        loadGuestState();
    }, []);

    const loginAsGuest = async () => {
        try {
            await AsyncStorage.setItem('is_guest', 'true');
            setIsGuest(true);
        } catch (e) {
            console.error('Failed to set guest state', e);
        }
    };

    const logout = async () => {
        try {
            if (isGuest) {
                await AsyncStorage.removeItem('is_guest');
                setIsGuest(false);
            } else {
                await signOut(auth);
            }
        } catch (e) {
            console.error('Logout failed', e);
        }
    };

    const refreshUserProfile = async () => {
        if (user) {
            try {
                const profile = await UserService.getUser(user.uid);
                setUserProfile(profile);
            } catch (error) {
                console.error('Error refreshing user profile:', error);
            }
        }
    };

    useEffect(() => {
        let profileUnsubscribe: (() => void) | null = null;

        console.log('[AuthContext] Subscribing to auth state change...');
        const authUnsubscribe = onAuthStateChanged(auth, (currentUser) => {
            console.log('[AuthContext] Auth state changed. User:', currentUser ? currentUser.uid : 'null');
            setUser(currentUser);

            // If real user logs in, ensure guest mode is off
            if (currentUser) {
                setIsGuest(false);
                AsyncStorage.removeItem('is_guest');
            }

            // Unsubscribe from previous profile listener
            if (profileUnsubscribe) {
                profileUnsubscribe();
                profileUnsubscribe = null;
            }

            if (currentUser) {
                const userRef = doc(db, 'users', currentUser.uid);
                profileUnsubscribe = onSnapshot(userRef,
                    (docSnap) => {
                        if (docSnap.exists()) {
                            setUserProfile(docSnap.data() as User);
                        } else {
                            setUserProfile(null);
                        }
                        setLoading(false);
                    },
                    (error) => {
                        console.error('[AuthContext] Profile snapshot error:', error);
                        setLoading(false);
                    }
                );
            } else {
                setUserProfile(null);
                setLoading(false);
            }
        });

        return () => {
            authUnsubscribe();
            if (profileUnsubscribe) profileUnsubscribe();
        };
    }, []);

    return (
        <AuthContext.Provider value={{ user, userProfile, loading, isGuest, loginAsGuest, logout, refreshUserProfile }}>
            {children}
        </AuthContext.Provider>
    );
};
