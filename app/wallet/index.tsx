import { Colors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { TransactionService } from '@/services/TransactionService';
import { UserService } from '@/services/UserService';
import { Transaction, User } from '@/types/firestore';
import { LinearGradient } from 'expo-linear-gradient'; // Install if not already
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function WalletScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const { user, refreshUserProfile } = useAuth();
    const [profile, setProfile] = useState<User | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        if (!user) return;
        try {
            setLoading(true);
            const [userData, txData] = await Promise.all([
                UserService.getUser(user.uid),
                TransactionService.getUserTransactions(user.uid)
            ]);
            setProfile(userData);
            setTransactions(txData.sort((a, b) => b.timestamp.seconds - a.timestamp.seconds)); // Sort new to old
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [user])
    );

    const handleAddFunds = async () => {
        if (!user) return;
        Alert.alert(
            'Add Funds',
            'Add $10.00 to your wallet?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Add $10',
                    onPress: async () => {
                        try {
                            await TransactionService.recordTransaction(user.uid, 'PAYMENT', 10);
                            await UserService.addFunds(user.uid, 10);
                            await loadData(); // Reload
                            if (refreshUserProfile) refreshUserProfile(); // Update context
                            Alert.alert('Success', 'Funds added!');
                        } catch (e) {
                            Alert.alert('Error', 'Failed to add funds');
                        }
                    }
                }
            ]
        );
    };

    const balance = profile?.walletBalance || 0;
    const isNegative = balance < 0;

    return (
        <ScrollView
            contentContainerStyle={[styles.scrollContent, { backgroundColor: theme.background }]}
            refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} />}
        >
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.text }]}>Wallet</Text>
            </View>

            {/* Balance Card */}
            <LinearGradient
                colors={isNegative ? ['#E63946', '#B00020'] : ['#2EC4B6', '#CBF3F0']}
                style={styles.card}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <Text style={[styles.cardLabel, { color: isNegative ? '#FFD' : '#0F2027' }]}>CURRENT BALANCE</Text>
                <Text style={[styles.cardValue, { color: isNegative ? '#FFF' : '#0F2027' }]}>
                    ${balance.toFixed(2)}
                </Text>
                <Text style={[styles.cardSub, { color: isNegative ? '#FFD' : '#0F2027' }]}>
                    {isNegative ? 'Please top up to continue.' : 'You are safe... for now.'}
                </Text>
            </LinearGradient>

            {/* Action Buttons */}
            <TouchableOpacity
                style={[styles.addButton, { backgroundColor: theme.primary }]}
                onPress={handleAddFunds}
            >
                <Text style={styles.addButtonText}>+ Add $10.00</Text>
            </TouchableOpacity>

            <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Transactions</Text>

            {transactions.map((tx) => (
                <View key={tx.id} style={[styles.txItem, { borderBottomColor: theme.border }]}>
                    <View>
                        <Text style={[styles.txType, { color: theme.text }]}>
                            {tx.type === 'PENALTY' ? 'Snooze Penalty' : 'Funds Added'}
                        </Text>
                        <Text style={[styles.txDate, { color: theme.icon }]}>
                            {tx.timestamp?.toDate().toLocaleDateString()}
                        </Text>
                    </View>
                    <Text style={[
                        styles.txAmount,
                        { color: tx.type === 'PENALTY' ? theme.error : theme.primary }
                    ]}>
                        {tx.type === 'PENALTY' ? '-' : '+'}${tx.amount.toFixed(2)}
                    </Text>
                </View>
            ))}

            {transactions.length === 0 && (
                <Text style={{ color: theme.icon, marginTop: 20, fontStyle: 'italic' }}>No transactions yet.</Text>
            )}

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        padding: 20,
    },
    header: {
        marginBottom: 20,
        marginTop: 10,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
    },
    card: {
        padding: 30,
        borderRadius: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    cardLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 5,
        opacity: 0.8,
    },
    cardValue: {
        fontSize: 48,
        fontWeight: 'bold',
    },
    cardSub: {
        fontSize: 14,
        marginTop: 5,
        fontStyle: 'italic',
        opacity: 0.9,
    },
    addButton: {
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 30,
    },
    addButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    txItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    txType: {
        fontSize: 16,
        fontWeight: '500',
    },
    txDate: {
        fontSize: 12,
        marginTop: 4,
    },
    txAmount: {
        fontSize: 18,
        fontWeight: 'bold',
    },
});
