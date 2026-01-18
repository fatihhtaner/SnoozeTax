import { db } from '@/config/firebaseConfig';
import { Transaction } from '@/types/firestore';
import { addDoc, collection, getDocs, query, Timestamp, where } from 'firebase/firestore';
import { UserService } from './UserService';

export const TransactionService = {
    /**
     * Records a new transaction (Penalty or Payment).
     * Also updates the user's total aggregate stats.
     */
    async recordTransaction(userId: string, type: 'PENALTY' | 'PAYMENT', amount: number, alarmId?: string) {
        const transactionsRef = collection(db, 'transactions');

        const newTransaction: Omit<Transaction, 'id'> = {
            userId,
            type,
            amount,
            timestamp: Timestamp.now(),
            alarmId,
        };

        const docRef = await addDoc(transactionsRef, newTransaction);

        // If it's a penalty, update user stats immediately
        if (type === 'PENALTY') {
            await UserService.updateUserStats(userId, amount, true);
        }

        return { id: docRef.id, ...newTransaction };
    },

    /**
     * Fetches user's transaction history.
     */
    async getUserTransactions(userId: string) {
        const transactionsRef = collection(db, 'transactions');
        const q = query(transactionsRef, where('userId', '==', userId));
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as Transaction[];
    }
};
