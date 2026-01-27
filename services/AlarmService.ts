import { db } from '@/config/firebaseConfig';
import { Alarm } from '@/types/firestore';
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    query,
    Timestamp,
    updateDoc,
    where
} from 'firebase/firestore';

import AsyncStorage from '@react-native-async-storage/async-storage';

export const AlarmService = {
    /**
     * Creates a new alarm.
     */
    async addAlarm(userId: string, alarmData: Omit<Alarm, 'id' | 'userId'>) {
        if (userId === 'guest') {
            const stored = await AsyncStorage.getItem('guest_alarms');
            const alarms = stored ? JSON.parse(stored) : [];
            const newAlarm = {
                id: Date.now().toString(), // Simple ID generation
                userId,
                ...alarmData,
                // Ensure timestamps are serializable/compatible
                createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 },
                updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 }
            };
            alarms.push(newAlarm);
            await AsyncStorage.setItem('guest_alarms', JSON.stringify(alarms));
            return newAlarm;
        }

        const alarmsRef = collection(db, 'alarms');
        const newAlarm = {
            ...alarmData,
            userId,
        };
        const docRef = await addDoc(alarmsRef, newAlarm);
        return { id: docRef.id, ...newAlarm };
    },

    /**
     * Updates an existing alarm.
     */
    async updateAlarm(id: string, updates: Partial<Alarm>) {
        // Check if it's a guest alarm (by attempting to find it in local storage first, or by ID format if we had one)
        // Since we don't pass userId here, we need a way to know. 
        // Strategy: Guest IDs are numeric strings (Date.now()), Firestore IDs are alphanumeric.
        // OR: We try to read from local storage first.

        const stored = await AsyncStorage.getItem('guest_alarms');
        let alarms: Alarm[] = stored ? JSON.parse(stored) : [];
        const index = alarms.findIndex(a => a.id === id);

        if (index !== -1) {
            // It's a guest alarm
            alarms[index] = { ...alarms[index], ...updates };
            await AsyncStorage.setItem('guest_alarms', JSON.stringify(alarms));
            return;
        }

        const alarmRef = doc(db, 'alarms', id);
        await updateDoc(alarmRef, updates);
    },

    /**
     * Snoozes an alarm for N minutes.
     */
    async snoozeAlarm(id: string, minutes: number) {
        const stored = await AsyncStorage.getItem('guest_alarms');
        let alarms: Alarm[] = stored ? JSON.parse(stored) : [];
        const index = alarms.findIndex(a => a.id === id);

        if (index !== -1) {
            const newTime = new Date();
            newTime.setMinutes(newTime.getMinutes() + minutes);

            // Reconstruct pseudo-Timestamp
            alarms[index].time = {
                seconds: Math.floor(newTime.getTime() / 1000),
                nanoseconds: 0
            } as any;

            await AsyncStorage.setItem('guest_alarms', JSON.stringify(alarms));
            return;
        }

        const alarmRef = doc(db, 'alarms', id);
        const newTime = new Date();
        newTime.setMinutes(newTime.getMinutes() + minutes);

        await updateDoc(alarmRef, {
            time: Timestamp.fromDate(newTime)
        });
    },

    /**
     * Deletes an alarm.
     */
    async deleteAlarm(id: string) {
        const stored = await AsyncStorage.getItem('guest_alarms');
        let alarms: Alarm[] = stored ? JSON.parse(stored) : [];
        const index = alarms.findIndex(a => a.id === id);

        if (index !== -1) {
            alarms.splice(index, 1);
            await AsyncStorage.setItem('guest_alarms', JSON.stringify(alarms));
            return;
        }

        const alarmRef = doc(db, 'alarms', id);
        await deleteDoc(alarmRef);
    },

    /**
     * Fetches all alarms for a specific user.
     */
    async getUserAlarms(userId: string) {
        if (userId === 'guest') {
            const stored = await AsyncStorage.getItem('guest_alarms');
            const alarms: Alarm[] = stored ? JSON.parse(stored) : [];

            // Hydrate "Timestamp" objects back to be usable if needed, 
            // but our UI expects .toDate(). We need to patch the method
            return alarms.map(a => ({
                ...a,
                time: {
                    ...a.time,
                    toDate: () => new Date(a.time.seconds * 1000)
                }
            })) as unknown as Alarm[];
        }

        const alarmsRef = collection(db, 'alarms');
        const q = query(alarmsRef, where('userId', '==', userId));
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as Alarm[];
    }
};
