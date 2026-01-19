import { Colors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AlarmService } from '@/services/AlarmService';
import { TransactionService } from '@/services/TransactionService';
import { UserService } from '@/services/UserService';
import { Alarm } from '@/types/firestore';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ActiveAlarmScreen() {
    const { alarmId } = useLocalSearchParams<{ alarmId: string }>();
    const router = useRouter();
    const { user } = useAuth();
    const { t } = useLanguage();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    const [alarm, setAlarm] = useState<Alarm | null>(null);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Payment State
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (alarmId && user) {
            loadAlarm(alarmId);
        }
    }, [alarmId, user]);

    const loadAlarm = async (id: string) => {
        try {
            // In a real app we'd get single doc, here re-using getUserAlarms for simplicity in MVP 
            // or we can implement getAlarm in service.
            // For now, let's just fetch all and find (or better, implement getAlarm).
            // Let's assume we implement getAlarm or just fetch user alarms.
            const alarms = await AlarmService.getUserAlarms(user!.uid);
            const found = alarms.find(a => a.id === id);
            if (found) setAlarm(found);
        } catch (error) {
            console.error(error);
        }
    };

    const handleWakeUp = async () => {
        if (alarm?.id && alarm.repeat.length === 0) {
            await AlarmService.updateAlarm(alarm.id, { isActive: false });
        }

        // Reward user for waking up!
        if (user) {
            await UserService.updateUserStats(user.uid, 0, false, true);
        }

        Alert.alert(t('welcome'), t('wake_up_success_msg'));
        router.replace('/(tabs)');
    };

    const handleSnoozePress = () => {
        setShowPaymentModal(true);
    };

    const processPayment = async () => {
        if (!alarm || !user) return;

        setIsProcessing(true);

        // Artificial Friction: Wait 3 seconds to simulate "Charging Card"
        await new Promise(resolve => setTimeout(resolve, 3000));

        try {
            await TransactionService.recordTransaction(
                user.uid,
                'PENALTY',
                alarm.penaltyAmount,
                alarm.id
            );

            if (alarm.id) {
                await AlarmService.snoozeAlarm(alarm.id, 9);
            }

            setIsProcessing(false);
            setIsSuccess(true);

            // Wait a moment to show success state
            setTimeout(() => {
                setShowPaymentModal(false);
                router.replace('/(tabs)');
            }, 1500);

        } catch (error) {
            setIsProcessing(false);
            Alert.alert(t('error'), t('transaction_failed'));
            setShowPaymentModal(false);
        }
    };

    const cancelPayment = () => {
        if (!isProcessing && !isSuccess) {
            setShowPaymentModal(false);
        }
    };

    // Safe check for penalty amount to avoid crash
    const penalty = alarm?.penaltyAmount || 0;

    return (
        <LinearGradient
            colors={['#16222A', '#3A6073']} // Deep Blue Morning Gradient
            style={styles.container}
        >
            <SafeAreaView style={styles.safeArea}>
                <Stack.Screen options={{ headerShown: false }} />

                <View style={styles.topContainer}>
                    <View style={styles.iconContainer}>
                        <LinearGradient
                            colors={['#FF9F1C', '#FF512F']}
                            style={styles.sunIcon}
                        >
                            <FontAwesome name="sun-o" size={60} color="#FFF" />
                        </LinearGradient>
                    </View>
                    <Text style={styles.time}>
                        {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                    <Text style={styles.date}>
                        {currentTime.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
                    </Text>
                    {alarm?.label && (
                        <Text style={styles.label}>{alarm.label}</Text>
                    )}
                </View>

                <View style={styles.bottomContainer}>
                    <TouchableOpacity
                        style={styles.wakeUpButton}
                        onPress={handleWakeUp}>
                        <LinearGradient
                            colors={['#CBF3F0', '#2EC4B6']}
                            style={styles.gradientButton}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                        >
                            <Text style={styles.wakeUpText}>{t('im_up')}</Text>
                            <Text style={styles.subText}>{t('stop_alarm')}</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.snoozeButton}
                        onPress={handleSnoozePress}>
                        <Text style={styles.snoozeText}>
                            {t('snooze').toUpperCase()} (${penalty.toFixed(2)})
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Payment Modal */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={showPaymentModal}
                    onRequestClose={cancelPayment}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            {!isSuccess ? (
                                <>
                                    <View style={styles.modalHeader}>
                                        <Text style={styles.modalTitle}>{t('payment_required')}</Text>
                                        <TouchableOpacity onPress={cancelPayment} disabled={isProcessing}>
                                            <FontAwesome name="close" size={24} color="#999" />
                                        </TouchableOpacity>
                                    </View>

                                    <View style={styles.priceContainer}>
                                        <Text style={styles.priceLabel}>{t('penalty_label')}</Text>
                                        <Text style={styles.priceValue}>${penalty.toFixed(2)}</Text>
                                    </View>

                                    <Text style={styles.warningText}>
                                        {t('payment_warning')}
                                    </Text>

                                    <TouchableOpacity
                                        style={[styles.payButton, isProcessing && styles.payButtonDisabled]}
                                        onPress={processPayment}
                                        disabled={isProcessing}
                                    >
                                        {isProcessing ? (
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                                <ActivityIndicator color="#FFF" />
                                                <Text style={styles.payButtonText}>{t('processing')}</Text>
                                            </View>
                                        ) : (
                                            <Text style={styles.payButtonText}>{t('pay_now')}</Text>
                                        )}
                                    </TouchableOpacity>
                                </>
                            ) : (
                                <View style={styles.successContainer}>
                                    <FontAwesome name="check-circle" size={60} color="#4CAF50" />
                                    <Text style={styles.successTitle}>{t('payment_successful')}</Text>
                                    <Text style={styles.successSub}>{t('snooze_success_msg')}</Text>
                                </View>
                            )}
                        </View>
                    </View>
                </Modal>

            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
        justifyContent: 'space-between',
    },
    topContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconContainer: {
        marginBottom: 30,
        shadowColor: '#FF9F1C',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 20,
    },
    sunIcon: {
        width: 120,
        height: 120,
        borderRadius: 60,
        alignItems: 'center',
        justifyContent: 'center',
    },
    time: {
        fontSize: 80,
        fontWeight: '200',
        color: '#FFF',
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 10
    },
    date: {
        fontSize: 20,
        marginTop: 10,
        color: '#EEE',
        opacity: 0.8,
    },
    label: {
        fontSize: 24,
        marginTop: 20,
        color: '#FFF',
        fontStyle: 'italic',
    },
    bottomContainer: {
        padding: 30,
        gap: 20,
    },
    wakeUpButton: {
        height: 80,
        borderRadius: 40,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    gradientButton: {
        flex: 1,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    wakeUpText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#0F2027',
    },
    subText: {
        fontSize: 14,
        color: '#0F2027',
        opacity: 0.8,
    },
    snoozeButton: {
        height: 60,
        borderRadius: 30,
        borderWidth: 2,
        borderColor: '#E63946',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(230, 57, 70, 0.15)',
    },
    snoozeText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FF6B6B',
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 30,
        minHeight: 350,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    priceContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    priceLabel: {
        fontSize: 16,
        color: '#666',
        marginBottom: 5,
    },
    priceValue: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#333',
    },
    warningText: {
        textAlign: 'center',
        color: '#666',
        marginBottom: 30,
        fontSize: 16,
    },
    payButton: {
        backgroundColor: '#000',
        height: 60,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    payButtonDisabled: {
        backgroundColor: '#666',
    },
    payButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 18,
    },
    successContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 30,
    },
    successTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 20,
        marginBottom: 10,
    },
    successSub: {
        fontSize: 16,
        color: '#666',
    },
});
