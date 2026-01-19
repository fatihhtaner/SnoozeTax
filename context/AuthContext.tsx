import { auth } from '@/config/firebaseConfig';
import { UserService } from '@/services/UserService';
import { User } from '@/types/firestore';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
    user: FirebaseUser | null;
    userProfile: User | null;
    loading: boolean;
    refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    userProfile: null,
    loading: true,
    refreshUserProfile: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<FirebaseUser | null>(null);
    const [userProfile, setUserProfile] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

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
        console.log('[AuthContext] Subscribing to auth state change...');
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            console.log('[AuthContext] Auth state changed. User:', currentUser ? currentUser.uid : 'null');
            setUser(currentUser);
            if (currentUser) {
                // Fetch detailed profile
                try {
                    console.log('[AuthContext] Fetching user profile...');
                    const profile = await UserService.getUser(currentUser.uid);
                    console.log('[AuthContext] Profile fetched:', profile ? 'success' : 'null');
                    setUserProfile(profile);
                } catch (error) {
                    console.error('[AuthContext] Error fetching user profile:', error);
                }
            } else {
                setUserProfile(null);
            }
            console.log('[AuthContext] Setting loading to false');
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    return (
        <AuthContext.Provider value={{ user, userProfile, loading, refreshUserProfile }}>
            {children}
        </AuthContext.Provider>
    );
};
