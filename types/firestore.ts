import { Timestamp } from 'firebase/firestore';

export interface UserStats {
    totalSnoozes: number;
    totalMoneyLost: number;
    disciplineScore: number;
}

export interface UserSettings {
    currency: string;
    defaultSnoozeTime: number; // minutes
}

export interface User {
    uid: string;
    email: string;
    displayName: string | null;
    createdAt: Timestamp;
    settings: UserSettings;
    stats: UserStats;
}

export interface Alarm {
    id?: string;
    userId: string;
    time: Timestamp; // Store as timestamp for easier manipulation
    repeat: number[]; // Array of days (0=Sunday, 1=Monday...)
    isActive: boolean;
    penaltyAmount: number;
    label?: string;
    sound: string; // 'Classic' | 'Rain' | 'Energize'
}

export interface Transaction {
    id?: string;
    userId: string;
    type: 'PENALTY' | 'PAYMENT';
    amount: number;
    timestamp: Timestamp;
    alarmId?: string;
    description?: string;
}
