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

export const AlarmService = {
    /**
     * Creates a new alarm.
     */
    async addAlarm(userId: string, alarmData: Omit<Alarm, 'id' | 'userId'>) {
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
        const alarmRef = doc(db, 'alarms', id);
        await updateDoc(alarmRef, updates);
    },

    /**
     * Snoozes an alarm for N minutes.
     */
    async snoozeAlarm(id: string, minutes: number) {
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
        const alarmRef = doc(db, 'alarms', id);
        await deleteDoc(alarmRef);
    },

    /**
     * Fetches all alarms for a specific user.
     */
    async getUserAlarms(userId: string) {
        const alarmsRef = collection(db, 'alarms');
        const q = query(alarmsRef, where('userId', '==', userId));
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as Alarm[];
    }
};
