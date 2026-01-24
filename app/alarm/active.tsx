import GradientBackground from '@/components/GradientBackground';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { AlarmService } from '@/services/AlarmService';
import { SoundService } from '@/services/SoundService';
import { TransactionService } from '@/services/TransactionService';
import { UserService } from '@/services/UserService';
import { Alarm } from '@/types/firestore';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as InAppPurchases from 'expo-in-app-purchases';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

// Product IDs from App Store Connect
const TIER_IDS = [
    'com.snoozetax.tier1', // Mild ($0.99)
    'com.snoozetax.tier2', // Medium ($2.99)
    'com.snoozetax.tier3', // Harsh ($4.99)
    'com.snoozetax.tier4', // Nuclear ($9.99)
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

    // Play sound when alarm is loaded
    useEffect(() => {
        if (alarm?.sound) {
            SoundService.playSound(alarm.sound);
        }

        return () => {
            SoundService.stopSound();
        };
    }, [alarm]);

    // Initialize IAP 
    useEffect(() => {
        setupIAP();
        return () => {
            InAppPurchases.disconnectAsync();
        };
    }, []);

    const setupIAP = async () => {
        try {
            await InAppPurchases.connectAsync();

            // Set Listener for Purchase Updates
            InAppPurchases.setPurchaseListener(({ responseCode, results, errorCode }) => {
                if (responseCode === InAppPurchases.IAPResponseCode.OK && results) {
                    results.forEach(async (purchase) => {
                        if (!purchase.acknowledged) {
                            // "Consume" the product so it can be bought again (Consumable)
                            await InAppPurchases.finishTransactionAsync(purchase, true);
                            handlePaymentSuccess();
                        }
                    });
                } else if (responseCode === InAppPurchases.IAPResponseCode.USER_CANCELED) {
                    setIsProcessing(false);
                } else {
                    console.warn(`IAP Error ${errorCode}`);
                    setIsProcessing(false);
                    Alert.alert(t('error'), 'Purchase failed. Please try again.');
                }
            });

        } catch (error) {
            console.error("IAP Setup Error: ", error);
        }
    };

    const loadAlarm = async (id: string) => {
        if (id === 'test') {
            // Mock alarm for testing
            setAlarm({
                id: 'test',
                userId: user?.uid || 'test-user',
                time: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
                repeat: [],
                isActive: true,
                penaltyAmount: 0.99,
                tierId: 'com.snoozetax.tier1',
                label: 'Test Alarm',
                sound: 'Classic',
                createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
                updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
            });
            return;
        }

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

        const tierId = alarm.tierId; // e.g. 'com.snoozetax.tier1'

        try {
            if (tierId) {
                // Attempt Real Purchase
                await InAppPurchases.purchaseItemAsync(tierId);
                // Processing continues in setPurchaseListener
            } else {
                // Fallback if no tierId (should ideally not happen in prod)
                Alert.alert('Configuration Error', 'This alarm has no payment tier associated.');
                setIsProcessing(false);
            }
        } catch (error) {
            console.log("Purchase Error / Simulator Fallback:", error);
            // On Simulator, purchaseItemAsync throws error. We simulate success for Dev.
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

        // Skip DB updates for test alarm
        if (alarm.id === 'test') {
            setIsProcessing(false);
            Alert.alert('Snoozed!', 'Test mode: Payment successful (Simulated). Alarm snoozed for 9 minutes.');
            await SoundService.stopSound();
            router.replace('/(tabs)');
            return;
        }

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
            await SoundService.stopSound();
            router.replace('/(tabs)');

        } catch (error) {
            console.error(error);
            setIsProcessing(false);
        }
    };

    const handleWakeUp = async () => {
        if (alarm?.id === 'test') {
            // Skip DB updates for test alarm
            setShowSuccessModal(true);
            setTimeout(async () => {
                setShowSuccessModal(false);
                await SoundService.stopSound();
                router.replace('/(tabs)');
            }, 2500);
            return;
        }

        if (alarm?.id && alarm.repeat.length === 0) {
            await AlarmService.updateAlarm(alarm.id, { isActive: false });
        }

        if (user) {
            await UserService.updateUserStats(user.uid, 0, false, true);
        }

        setShowSuccessModal(true);

        setTimeout(async () => {
            setShowSuccessModal(false);
            await SoundService.stopSound();
            router.replace('/(tabs)');
        }, 2500);
    };

    const penalty = alarm?.penaltyAmount || 0;

    // Pulse Animation
    const pulseScale = useSharedValue(1);

    useEffect(() => {
        pulseScale.value = withRepeat(
            withTiming(1.1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
            -1,
            true
        );
    }, []);

    const animatedSunStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulseScale.value }],
    }));

    return (
        <GradientBackground>
            <SafeAreaView style={styles.safeArea}>
                <Stack.Screen options={{ headerShown: false }} />

                <View style={styles.topContainer}>
                    <Animated.View style={[styles.iconContainer, animatedSunStyle]}>
                        <LinearGradient
                            colors={['#FF9F1C', '#FF512F']}
                            style={styles.sunIcon}
                        >
                            <FontAwesome name="sun-o" size={60} color="#FFF" />
                        </LinearGradient>
                    </Animated.View>

                    <Text style={styles.date}>
                        {currentTime.toLocaleDateString(locale, { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase()}
                    </Text>
                    <Text style={styles.time}>
                        {currentTime.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
                    </Text>

                    {alarm?.label && (
                        <View style={styles.labelContainer}>
                            <Text style={styles.label}>{alarm.label}</Text>
                        </View>
                    )}
                </View>

                <View style={styles.bottomContainer}>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        style={styles.wakeUpButton}
                        onPress={handleWakeUp}>
                        <LinearGradient
                            colors={['#CBF3F0', '#2EC4B6']}
                            style={styles.gradientButton}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                        >
                            <Text style={styles.wakeUpText}>{t('im_up')}</Text>
                            <Text style={styles.subText}>{t('stop_alarm')}</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <View style={styles.snoozeContainer}>
                        <Text style={styles.penaltyLabel}>{t('penalty_label').toUpperCase()}</Text>
                        <TouchableOpacity
                            style={styles.snoozeButton}
                            onPress={handleSnoozePress}
                            disabled={isProcessing}
                        >
                            <LinearGradient
                                colors={['rgba(255, 107, 107, 0.2)', 'rgba(255, 107, 107, 0.4)']}
                                style={styles.snoozeGradient}
                            >
                                {isProcessing ? (
                                    <ActivityIndicator color="#FF6B6B" />
                                ) : (
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                        <Text style={styles.snoozeText}>
                                            {t('snooze').toUpperCase()}
                                        </Text>
                                        <View style={styles.priceTag}>
                                            <Text style={styles.priceText}>-${penalty.toFixed(2)}</Text>
                                        </View>
                                    </View>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                        <Text style={styles.snoozeHint}>
                            {t('payment_warning')}
                        </Text>
                    </View>
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
        paddingVertical: 20,
    },
    topContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 40,
    },
    iconContainer: {
        marginBottom: 40,
        shadowColor: '#FF9F1C',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 30,
    },
    sunIcon: {
        width: 140,
        height: 140,
        borderRadius: 70,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)'
    },
    time: {
        fontSize: 92,
        fontWeight: '200',
        color: '#FFF',
        textShadowColor: 'rgba(0, 0, 0, 0.2)',
        textShadowOffset: { width: 0, height: 4 },
        textShadowRadius: 10,
        letterSpacing: -2,
        fontVariant: ['tabular-nums'],
    },
    date: {
        fontSize: 14,
        fontWeight: '600',
        color: '#CBF3F0',
        letterSpacing: 2,
        marginBottom: 5,
    },
    labelContainer: {
        marginTop: 20,
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    label: {
        fontSize: 20,
        color: '#FFF',
        fontWeight: '500',
    },
    bottomContainer: {
        padding: 30,
        gap: 40,
        justifyContent: 'flex-end',
    },
    wakeUpButton: {
        height: 80,
        borderRadius: 25,
        shadowColor: '#2EC4B6',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 15,
        elevation: 10,
        transform: [{ scale: 1 }],
    },
    gradientButton: {
        flex: 1,
        borderRadius: 25,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 15,
    },
    wakeUpText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#0F2027',
        letterSpacing: 1,
    },
    subText: {
        display: 'none', // Simplified layout
    },
    snoozeContainer: {
        alignItems: 'center',
        gap: 10,
    },
    penaltyLabel: {
        color: 'rgba(255, 107, 107, 0.8)',
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    snoozeButton: {
        width: '100%',
        height: 64,
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 107, 107, 0.4)',
    },
    snoozeGradient: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    snoozeText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FF6B6B',
        letterSpacing: 1,
    },
    priceTag: {
        backgroundColor: '#FF6B6B',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    priceText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 14,
    },
    snoozeHint: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 11,
        textAlign: 'center',
    },
    // Success Modal Styles
    successModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    successModalContent: {
        alignItems: 'center',
        width: '100%',
        padding: 40,
    },
    successIconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 30,
        shadowColor: '#2EC4B6',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 30,
    },
    successModalTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 10,
        textAlign: 'center',
    },
    successModalMessage: {
        fontSize: 18,
        color: 'rgba(255, 255, 255, 0.7)',
        textAlign: 'center',
        marginBottom: 40,
        lineHeight: 28,
    },
    celebrationContainer: {
        flexDirection: 'row',
        gap: 20,
    },
    celebrationEmoji: {
        fontSize: 40,
    },
});
