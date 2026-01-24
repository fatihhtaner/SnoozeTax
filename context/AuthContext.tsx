import { auth, db } from '@/config/firebaseConfig';
import { UserService } from '@/services/UserService';
import { User } from '@/types/firestore';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
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
        let profileUnsubscribe: (() => void) | null = null;

        console.log('[AuthContext] Subscribing to auth state change...');
        const authUnsubscribe = onAuthStateChanged(auth, (currentUser) => {
            console.log('[AuthContext] Auth state changed. User:', currentUser ? currentUser.uid : 'null');
            setUser(currentUser);

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
        <AuthContext.Provider value={{ user, userProfile, loading, refreshUserProfile }}>
            {children}
        </AuthContext.Provider>
    );
};
