import { db } from '@/config/firebaseConfig';
import { User } from '@/types/firestore';
import { doc, getDoc, increment, setDoc, updateDoc } from 'firebase/firestore';

export const UserService = {
    /**
     * Creates a new user document in Firestore if it doesn't exist.
     */
    async createUser(uid: string, email: string, displayName: string | null) {
        const userRef = doc(db, 'users', uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            const newUser: User = {
                uid,
                email,
                displayName,
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
        }
        return userSnap.data() as User;
    },

    /**
     * Fetches user profile.
     */
    async getUser(uid: string) {
        const userRef = doc(db, 'users', uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
            return userSnap.data() as User;
        }
        return null;
    },

    /**
     * Updates user stats after a snooze or alarm event.
     */
    async updateUserStats(uid: string, penaltyAmount: number = 0, snoozed: boolean = false) {
        const userRef = doc(db, 'users', uid);

        // Logic for discipline score would be more complex in real app, simplistic here
        // In a real app we might recalculate based on history

        await updateDoc(userRef, {
            'stats.totalSnoozes': snoozed ? increment(1) : increment(0),
            'stats.totalMoneyLost': increment(penaltyAmount),
            // 'stats.disciplineScore': ... // To be implemented with more complex logic
        });
    }
};
