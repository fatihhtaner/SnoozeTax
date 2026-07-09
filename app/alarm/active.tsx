import GradientBackground from '@/components/GradientBackground';
import { ALL_PRODUCT_IDS, PENALTY_TIERS as TIERS_INFO } from '@/constants/Products';
import { useAuth } from '@/context/AuthContext';
import { useGlobalModal } from '@/context/GlobalModalContext';
import { useLanguage } from '@/context/LanguageContext';
import { AlarmService } from '@/services/AlarmService';
import { NotificationService } from '@/services/NotificationService';
import { SoundService } from '@/services/SoundService';
import { TransactionService } from '@/services/TransactionService';
import { UserService } from '@/services/UserService';
import { Alarm } from '@/types/firestore';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as InAppPurchases from 'expo-in-app-purchases';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const PENALTY_TIERS = TIERS_INFO.map(t => ({ amount: t.amount })); // Keep existing structure for now if needed, or refactor usage

export default function ActiveAlarmScreen() {
    const { alarmId, penaltyAmount, sound, label } = useLocalSearchParams<{
        alarmId: string,
        penaltyAmount?: string,
        sound?: string,
        label?: string
    }>();
    const router = useRouter();
    const { user } = useAuth();
    const { t, locale } = useLanguage();
    const { showSuccessModal } = useGlobalModal();

    const [alarm, setAlarm] = useState<Alarm | null>(null);
    const [currentTime, setCurrentTime] = useState(new Date());

    // IAP State
    const [iapReady, setIapReady] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [availableProducts, setAvailableProducts] = useState<InAppPurchases.IAPItemDetails[]>([]);
    const iapInitRef = useRef<Promise<InAppPurchases.IAPItemDetails[]> | null>(null);
    const iapQueueRef = useRef<Promise<unknown>>(Promise.resolve());
    const purchaseListenerSet = useRef(false);
    const iapConnectedRef = useRef(false);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (alarmId) {
            loadAlarm(alarmId, penaltyAmount, sound, label);
        }
    }, [alarmId, user, penaltyAmount, sound, label]);

    // Play sound when alarm is loaded
    // Play sound when alarm is loaded
    useEffect(() => {
        if (alarm?.sound) {
            // Silence notifications while we play sound manually
            NotificationService.setForegroundBehavior(false);
            SoundService.playSound(alarm.sound);
        }

        return () => {
            SoundService.stopSound();
            // Restore notification sound behavior
            NotificationService.setForegroundBehavior(true);
        };
    }, [alarm?.sound]);

    const runIAP = <T,>(label: string, fn: () => Promise<T>): Promise<T> => {
        const next = iapQueueRef.current
            .catch(() => undefined)
            .then(async () => {
                try {
                    return await fn();
                } catch (error) {
                    console.warn(`[IAP] ${label} failed:`, error);
                    throw error;
                }
            });
        iapQueueRef.current = next.then(() => undefined, () => undefined);
        return next;
    };

    const connectIAPInternal = async () => {
        if (iapConnectedRef.current) return;
        try {
            await InAppPurchases.connectAsync();
            iapConnectedRef.current = true;
        } catch (error: any) {
            if (error?.message?.includes('Already connected')) {
                iapConnectedRef.current = true;
                return;
            }
            throw error;
        }
    };

    const fetchProductsInternal = async (): Promise<InAppPurchases.IAPItemDetails[]> => {
        await connectIAPInternal();
        const { results } = await InAppPurchases.getProductsAsync(ALL_PRODUCT_IDS);
        return results ?? [];
    };

    const ensureIAPReady = (): Promise<InAppPurchases.IAPItemDetails[]> => {
        if (!iapInitRef.current) {
            iapInitRef.current = runIAP('init', async () => {
                const products = await fetchProductsInternal();
                console.log('[IAP] Products loaded:', products.map(p => p.productId).join(', ') || 'none');
                return products;
            }).catch((error) => {
                iapInitRef.current = null;
                throw error;
            });
        }
        return iapInitRef.current;
    };

    const purchaseProduct = (productId: string) =>
        runIAP('purchase', async () => {
            await connectIAPInternal();
            await InAppPurchases.purchaseItemAsync(productId);
        });

    // Initialize IAP — all native calls go through runIAP queue
    useEffect(() => {
        if (!purchaseListenerSet.current) {
            purchaseListenerSet.current = true;
            InAppPurchases.setPurchaseListener(({ responseCode, results, errorCode }) => {
                if (responseCode === InAppPurchases.IAPResponseCode.OK && results) {
                    results.forEach(async (purchase) => {
                        if (!purchase.acknowledged) {
                            await InAppPurchases.finishTransactionAsync(purchase, true);
                            handlePaymentSuccess();
                        }
                    });
                } else if (responseCode === InAppPurchases.IAPResponseCode.USER_CANCELED) {
                    setIsProcessing(false);
                } else {
                    console.warn(`IAP Error ${errorCode}`);
                    setIsProcessing(false);
                    Alert.alert(t('error'), t('purchase_failed'));
                }
            });
        }

        ensureIAPReady()
            .then((products) => {
                setAvailableProducts(products);
                setIapReady(true);
            })
            .catch((error) => {
                console.error('[IAP] Setup Error:', error);
                setAvailableProducts([]);
                setIapReady(true);
            });

        const retryTimer = setTimeout(() => {
            iapInitRef.current = null;
            ensureIAPReady()
                .then((products) => {
                    if (products.length > 0) {
                        setAvailableProducts(products);
                        setIapReady(true);
                    }
                })
                .catch((error) => console.warn('[IAP] Retry failed:', error));
        }, 5000);

        return () => {
            clearTimeout(retryTimer);
            // Do NOT disconnect here — causes race if user opens alarm again quickly
        };
    }, []);

    const loadAlarm = async (id: string, pAmount?: string, pSound?: string, pLabel?: string) => {
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

        const userId = user?.uid || 'guest';

        // 1. Try to use offline data from notification payload first
        if (pAmount && pSound) {
            console.log('[ActiveAlarm] Using offline data from payload');
            setAlarm({
                id,
                userId,
                time: { seconds: Date.now() / 1000, nanoseconds: 0 } as any, // Placeholder
                repeat: [],
                isActive: true,
                penaltyAmount: parseFloat(pAmount),
                // Infer tierId from amount by matching to PENALTY_TIERS
                tierId: (() => {
                    const amount = parseFloat(pAmount);
                    const tier = TIERS_INFO.find(t => Math.abs(t.amount - amount) < 0.01);
                    return tier?.id || 'com.iftsoftware.snoozetax.tier1';
                })(),
                label: pLabel || '',
                sound: pSound,
                createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
                updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
            });
            // We can still try to fetch in background to get more up-to-date data, 
            // but we don't block the UI.
        }

        // 2. Fetch from DB to ensure validity (and get correct ID if needed for IAP)
        try {
            const alarms = await AlarmService.getUserAlarms(userId);
            const found = alarms.find(a => a.id === id);
            if (found) {
                setAlarm(found);
            }
        } catch (error) {
            console.error('Failed to fetch alarm from DB (Offline mode?)', error);
            // If we didn't have offline params, we're in trouble. 
            // But if we did, we already set the state above.
        }
    };

    const offerDevSimulation = (reason?: string) => {
        console.warn('[IAP] Dev simulation:', reason ?? 'fallback');
        Alert.alert(
            t('dev_mode_title'),
            t('dev_simulate_purchase'),
            [
                { text: t('cancel'), style: 'cancel', onPress: () => setIsProcessing(false) },
                { text: 'OK', onPress: () => { void handlePaymentSuccess(); } },
            ]
        );
    };

    const handleSnoozePress = async () => {
        if (!alarm) return;

        setIsProcessing(true);

        let products = availableProducts;
        try {
            products = await ensureIAPReady();
            setAvailableProducts(products);
            setIapReady(true);
        } catch (error) {
            console.warn('[IAP] Could not initialize before purchase:', error);
            if (__DEV__) {
                offerDevSimulation('IAP init failed');
                return;
            }
            Alert.alert(t('error'), t('iap_unavailable'));
            setIsProcessing(false);
            return;
        }

        // Store returned nothing — common in dev builds before App Store Connect is set up
        if (products.length === 0) {
            if (__DEV__) {
                offerDevSimulation('no store products');
                return;
            }
            Alert.alert(t('error'), t('iap_products_unavailable'));
            setIsProcessing(false);
            return;
        }

        const tierId = alarm.tierId;
        const penaltyAmount = alarm.penaltyAmount || 0;

        try {
            if (tierId) {
                let product = products.find(p => p.productId === tierId);

                if (!product) {
                    const matchingTier = TIERS_INFO.find(t => Math.abs(t.amount - penaltyAmount) < 0.01);
                    if (matchingTier) {
                        product = products.find(p => p.productId === matchingTier.id);
                    }
                }

                if (!product) {
                    product = products[0];
                    console.warn('[IAP] Using first available product as fallback:', product.productId);
                }

                console.log('[IAP] Purchasing product:', product.productId, product.title);
                await purchaseProduct(product.productId);
            } else if (penaltyAmount > 0) {
                const matchingTier = TIERS_INFO.find(t => Math.abs(t.amount - penaltyAmount) < 0.01);
                const product = matchingTier
                    ? products.find(p => p.productId === matchingTier.id)
                    : products[0];

                if (product) {
                    await purchaseProduct(product.productId);
                    return;
                }

                Alert.alert(t('error'), t('no_payment_tier'));
                setIsProcessing(false);
            } else {
                Alert.alert(t('error'), t('no_payment_tier'));
                setIsProcessing(false);
            }
        } catch (error: any) {
            console.warn('[IAP] Purchase error:', error?.message ?? error);
            if (__DEV__) {
                offerDevSimulation('purchaseItemAsync failed');
            } else {
                Alert.alert(t('error'), t('purchase_failed'));
                setIsProcessing(false);
            }
        }
    };

    const handlePaymentSuccess = async () => {
        if (!alarm) return;

        // Skip DB updates for test alarm
        if (alarm.id === 'test') {
            setIsProcessing(false);
            Alert.alert('Snoozed!', 'Test mode: Payment successful (Simulated). Alarm snoozed for 9 minutes.');
            await SoundService.stopSound();
            await NotificationService.cancelAlarm('test');
            router.replace('/(tabs)');
            return;
        }

        try {
            await TransactionService.recordTransaction(
                user?.uid || 'guest',
                'PENALTY',
                alarm.penaltyAmount,
                alarm.id
            );

            // Stop the current ring first.
            await SoundService.stopSound();

            if (alarm.id) {
                // Stop the currently ringing sequence WITHOUT destroying a repeating
                // (weekly) schedule, so a repeat alarm still fires next week...
                await NotificationService.dismissCurrentRing(alarm.id);
                // ...then re-schedule it to ring again after the snooze period.
                // (dismissCurrentRing suppresses the id for ~10s, which is well before
                // the 9-minute snooze fires, so there is no conflict.)
                await NotificationService.scheduleSnooze(
                    alarm.id,
                    t('wake_up') || 'Wake Up!',
                    alarm.label || t('time_to_get_up') || 'Time to get up!',
                    9,
                    alarm.sound || 'default',
                    { penaltyAmount: alarm.penaltyAmount, sound: alarm.sound, label: alarm.label }
                );
            }

            setIsProcessing(false);
            Alert.alert('Snoozed!', 'Payment successful. Alarm snoozed for 9 minutes.');
            router.replace('/(tabs)');

        } catch (error) {
            console.error(error);
            setIsProcessing(false);
            Alert.alert(t('error') || 'Error', 'Snooze failed. Please try again.');
        }
    };

    const handleWakeUp = async () => {
        try {
            const targetId = alarmId || alarm?.id;
            console.log(`[ActiveAlarm] User clicked I'm Up. targetId: ${targetId}`);

            // 1. Stop sound and notifications IMMEDIATELY
            await SoundService.stopSound();

            const isRepeating = !!(alarm?.repeat && alarm.repeat.length > 0);

            if (targetId) {
                // Suppress triggering new navigation from these cancellations
                NotificationService.suppressAlarm(targetId);
                if (isRepeating) {
                    // Repeating alarm: only stop the current ring, keep the weekly
                    // schedule so it fires again next week.
                    await NotificationService.dismissCurrentRing(targetId);
                } else {
                    // One-shot alarm: cancel everything.
                    await NotificationService.cancelAlarm(targetId);
                }
            } else {
                console.warn('[ActiveAlarm] No ID found to suppress!');
            }

            // 2. Handle Test Alarm
            if (targetId === 'test') {
                showSuccessModal();
                router.replace('/(tabs)');
                return;
            }

            // 3. Update DB (Backend)
            // We do this concurrently but don't let it block the UI reaction too much if possible
            // But we do want to wait for it to ensure data consistency
            console.log(`[ActiveAlarm] Checking repeat for deactivation. targetId: ${targetId}, repeat: ${JSON.stringify(alarm?.repeat)}`);
            if (targetId && (!alarm?.repeat || alarm.repeat.length === 0)) {
                console.log(`[ActiveAlarm] Deactivating non-repeating alarm: ${targetId}`);
                await AlarmService.updateAlarm(targetId, { isActive: false });
            }

            if (user) {
                await UserService.updateUserStats(user.uid, 0, false, true);
            }

            // 4. Show Success and Exit
            showSuccessModal();
            router.replace('/(tabs)');

        } catch (error) {
            console.error('[ActiveAlarm] Error in handleWakeUp:', error);
            // Even if DB fails, we must stop technical alarm artifacts
            await SoundService.stopSound();
            const targetId = alarmId || alarm?.id;
            if (targetId) {
                NotificationService.suppressAlarm(targetId);
                await NotificationService.cancelAlarm(targetId);
            }

            // Still let them out, or show error? 
            // Better to let them out to stop the annoyance.
            Alert.alert('Error', 'Could not update stats, but alarm is stopped.');
            router.replace('/(tabs)');
        }
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
                            colors={['#FDB931', '#FFD700']}
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
        shadowColor: '#FFD700',
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

});
