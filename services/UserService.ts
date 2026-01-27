import { db } from '@/config/firebaseConfig';
import { User } from '@/types/firestore';
import { deleteDoc, doc, getDoc, increment, setDoc, updateDoc } from 'firebase/firestore';

export const UserService = {
    /**
     * Creates a new user document in Firestore if it doesn't exist.
     */
    async createUser(uid: string, email: string, displayName: string | null, photoURL?: string | null) {
        const userRef = doc(db, 'users', uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            const newUser: User = {
                uid,
                email,
                displayName,
                photoURL: photoURL || null,
                createdAt: new Date() as any, // Firestore converts Date to Timestamp automatically on write
                settings: {
                    currency: 'USD',
                    defaultSnoozeTime: 9,
                },
                stats: {
                    totalSnoozes: 0,
                    totalMoneyLost: 0,
                    disciplineScore: 100,
                },
            };
            await setDoc(userRef, newUser);
            return newUser;
        } else {
            // Sync user profile data if it changed
            const userData = userSnap.data() as User;
            const updates: Partial<User> = {};

            if (photoURL && userData.photoURL !== photoURL) {
                updates.photoURL = photoURL;
            }
            // Also sync display name if it changed and is valid
            if (displayName && userData.displayName !== displayName) {
                updates.displayName = displayName;
            }

            if (Object.keys(updates).length > 0) {
                await updateDoc(userRef, updates as any);
                return { ...userData, ...updates };
            }
        }
        return userSnap.data() as User;
    },

    /**
     * Fetches user profile.
     */
    async getUser(uid: string) {
        if (uid === 'guest') return null;

        const userRef = doc(db, 'users', uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
            return userSnap.data() as User;
        }
        return null;
    },

    async updateUser(uid: string, data: Partial<User>) {
        const userRef = doc(db, 'users', uid);
        await updateDoc(userRef, data as any);
    },

    /**
     * Updates user stats after a snooze or alarm event.
     */
    /**
     * Updates user stats after a snooze or alarm event.
     */
    async updateUserStats(uid: string, penaltyAmount: number = 0, snoozed: boolean = false, isWakeUp: boolean = false) {
        if (uid === 'guest') return;

        const userRef = doc(db, 'users', uid);

        // Fetch current score to calculate new one
        // Note: In high concurrency this should be a transaction, but simple get/update is fine for MVP
        const userSnap = await getDoc(userRef);
        let currentScore = 100;
        if (userSnap.exists()) {
            const userData = userSnap.data() as User;
            currentScore = userData.stats?.disciplineScore ?? 100;
        }

        let newScore = currentScore;
        if (snoozed) {
            newScore = Math.max(0, currentScore - 5);
        } else if (isWakeUp) {
            newScore = Math.min(100, currentScore + 2);
        }

        if (userSnap.exists()) {
            await updateDoc(userRef, {
                'stats.totalSnoozes': snoozed ? increment(1) : increment(0),
                'stats.totalMoneyLost': increment(penaltyAmount),
                'stats.disciplineScore': newScore
            });
        } else {
            // Document doesn't exist, create it with setDoc
            await setDoc(userRef, {
                uid,
                createdAt: new Date(),
                stats: {
                    totalSnoozes: snoozed ? 1 : 0,
                    totalMoneyLost: penaltyAmount,
                    disciplineScore: newScore
                },
                settings: {
                    currency: 'USD',
                    defaultSnoozeTime: 9
                }
            }, { merge: true });
        }
    },

    /**
     * Deletes the user document from Firestore.
     */
    async deleteUser(uid: string) {
        const userRef = doc(db, 'users', uid);
        await deleteDoc(userRef);
    }
};
