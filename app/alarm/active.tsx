import GradientBackground from '@/components/GradientBackground';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { AlarmService } from '@/services/AlarmService';
import { TransactionService } from '@/services/TransactionService';
import { UserService } from '@/services/UserService';
import { Alarm } from '@/types/firestore';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as InAppPurchases from 'expo-in-app-purchases';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// IMPORTANT: These IDs normally come from App Store Connect.
// Since you haven't created them yet, this list is primarily for reference logic.
// In a real build, we fetch these from Apple.
const TIER_IDS = [
    'com.anonymous.snoozetax.tier1',
    'com.anonymous.snoozetax.tier2',
    'com.anonymous.snoozetax.tier3',
    'com.anonymous.snoozetax.tier4',
];

export default function ActiveAlarmScreen() {
    const { alarmId } = useLocalSearchParams<{ alarmId: string }>();
    const router = useRouter();
    const { user } = useAuth();
    const { t, locale } = useLanguage();

    const [alarm, setAlarm] = useState<Alarm | null>(null);
    const [currentTime, setCurrentTime] = useState(new Date());

    // IAP State
    const [isProcessing, setIsProcessing] = useState(false);

    // Success Modal State
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (alarmId && user) {
            loadAlarm(alarmId);
        }
    }, [alarmId, user]);

    // Initialize IAP 
    useEffect(() => {
        setupIAP();
        return () => {
            // Disconnect typically not strictly necessary in functional components but good practice if supported
            // InAppPurchases.disconnectAsync(); 
        };
    }, []);

    const setupIAP = async () => {
        try {
            await InAppPurchases.connectAsync();
            // In a real app, you would fetch products here:
            // await InAppPurchases.getProductsAsync(TIER_IDS);

            // Set Listener
            InAppPurchases.setPurchaseListener(({ responseCode, results, errorCode }) => {
                if (responseCode === InAppPurchases.IAPResponseCode.OK) {
                    results.forEach(purchase => {
                        if (!purchase.acknowledged) {
                            // "Consume" the product so it can be bought again
                            InAppPurchases.finishTransactionAsync(purchase, true);
                            handlePaymentSuccess();
                        }
                    });
                } else if (responseCode === InAppPurchases.IAPResponseCode.USER_CANCELED) {
                    setIsProcessing(false);
                } else {
                    console.warn(`IAP Error ${errorCode}`);
                    setIsProcessing(false);
                    // Failure handled in snoozePress
                }
            });

        } catch (error) {
            console.error("IAP Setup Error: ", error); // Likely due to simulator
        }
    };

    const loadAlarm = async (id: string) => {
        try {
            const alarms = await AlarmService.getUserAlarms(user!.uid);
            const found = alarms.find(a => a.id === id);
            if (found) setAlarm(found);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSnoozePress = async () => {
        if (!alarm || !user) return;
        setIsProcessing(true);

        const tierId = alarm.tierId; // e.g. 'com.anonymous.snoozetax.tier1'

        try {
            if (tierId) {
                // Attempt Real Purchase
                await InAppPurchases.purchaseItemAsync(tierId);
                // The rest happens in setPurchaseListener
            } else {
                // Fallback for old alarms (Mock Success for standard penalty)
                // Or if we decide to allow "Mock" on Simulator where IAP fails:
                // throw new Error("Simulator Fallback"); // Uncomment to force mock

                Alert.alert('Configuration Error', 'This alarm has no payment tier associated (Old version?).');
                setIsProcessing(false);
            }
        } catch (error) {
            console.log("Purchase Error / Simulator Fallback:", error);
            // On Simulator, purchaseItemAsync often fails or hangs. 
            // We simulate success here for Development purposes so you can test the UI.
            if (__DEV__) {
                Alert.alert("Dev Mode", "Simulating successful purchase (IAP not available on Simulator).", [
                    { text: "OK", onPress: () => handlePaymentSuccess() }
                ]);
            } else {
                Alert.alert('Error', 'Payment could not be initiated.');
                setIsProcessing(false);
            }
        }
    };

    const handlePaymentSuccess = async () => {
        if (!alarm || !user) return;

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
            Alert.alert('Snoozed!', 'Payment successful. Alarm snoozed for 9 minutes.');
            router.replace('/(tabs)');

        } catch (error) {
            console.error(error);
            setIsProcessing(false);
        }
    };

    const handleWakeUp = async () => {
        if (alarm?.id && alarm.repeat.length === 0) {
            await AlarmService.updateAlarm(alarm.id, { isActive: false });
        }

        if (user) {
            await UserService.updateUserStats(user.uid, 0, false, true);
        }

        setShowSuccessModal(true);

        setTimeout(() => {
            setShowSuccessModal(false);
            router.replace('/(tabs)');
        }, 2500);
    };

    const penalty = alarm?.penaltyAmount || 0;

    return (
        <GradientBackground>
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
                        {currentTime.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                    <Text style={styles.date}>
                        {currentTime.toLocaleDateString(locale, { weekday: 'long', month: 'long', day: 'numeric' })}
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
                        onPress={handleSnoozePress}
                        disabled={isProcessing}
                    >
                        {isProcessing ? (
                            <ActivityIndicator color="#FF6B6B" />
                        ) : (
                            <Text style={styles.snoozeText}>
                                {t('snooze').toUpperCase()} (${penalty.toFixed(2)})
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Success Modal */}
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={showSuccessModal}
                    onRequestClose={() => setShowSuccessModal(false)}
                >
                    <View style={styles.successModalOverlay}>
                        <View style={styles.successModalContent}>
                            <LinearGradient
                                colors={['#CBF3F0', '#2EC4B6']}
                                style={styles.successIconContainer}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <FontAwesome name="sun-o" size={60} color="#FFF" />
                            </LinearGradient>

                            <Text style={styles.successModalTitle}>{t('welcome')}</Text>
                            <Text style={styles.successModalMessage}>{t('wake_up_success_msg')}</Text>

                            <View style={styles.celebrationContainer}>
                                <Text style={styles.celebrationEmoji}>🎉</Text>
                                <Text style={styles.celebrationEmoji}>☀️</Text>
                                <Text style={styles.celebrationEmoji}>💪</Text>
                            </View>
                        </View>
                    </View>
                </Modal>

            </SafeAreaView>
        </GradientBackground>
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
        borderColor: '#FF6B6B',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 107, 107, 0.1)',
    },
    snoozeText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FF6B6B',
    },
    // Success Modal Styles
    successModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    successModalContent: {
        backgroundColor: '#1E293B',
        borderRadius: 30,
        padding: 40,
        alignItems: 'center',
        width: '85%',
        maxWidth: 400,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
    },
    successIconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        shadowColor: '#2EC4B6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
    },
    successModalTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 10,
        textAlign: 'center',
    },
    successModalMessage: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 24,
    },
    celebrationContainer: {
        flexDirection: 'row',
        gap: 15,
        marginTop: 10,
    },
    celebrationEmoji: {
        fontSize: 32,
    },
});
