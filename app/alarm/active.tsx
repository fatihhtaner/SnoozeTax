import GradientBackground from '@/components/GradientBackground';
import { ALL_PRODUCT_IDS, LEGACY_PRODUCT_IDS, PENALTY_TIERS as TIERS_INFO, PRODUCT_IDS } from '@/constants/Products'; // Renamed locally to avoid conflict if needed, or just use as is
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
import React, { useEffect, useState } from 'react';
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

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (alarmId && user) {
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

    // Initialize IAP 
    useEffect(() => {
        setupIAP();
        
        // Retry product loading if no products found initially (for "Ready to Submit" products)
        // These products may take a moment to become available, especially with Sandbox accounts
        const retryTimer = setTimeout(async () => {
            console.log('[IAP] Checking if products loaded, retrying if needed...');
            try {
                const { results } = await InAppPurchases.getProductsAsync(PRODUCT_IDS);
                if (results && results.length > 0) {
                    setAvailableProducts(results);
                    console.log('[IAP] Products loaded on retry:', results.map(p => p.productId).join(', '));
                }
            } catch (error) {
                console.warn('[IAP] Retry failed:', error);
            }
        }, 3000); // Retry after 3 seconds
        
        return () => {
            clearTimeout(retryTimer);
            // Safely disconnect
            InAppPurchases.disconnectAsync().catch(() => {
                // Ignore disconnect errors (e.g. already disconnected)
            });
        };
    }, []);

    const setupIAP = async () => {
        try {
            await InAppPurchases.connectAsync();
            // Query ONLY current product IDs first (not legacy) for better compatibility
            // "Ready to Submit" products should work with Sandbox test accounts
            const { results } = await InAppPurchases.getProductsAsync(PRODUCT_IDS);
            
            if (results && results.length > 0) {
                setAvailableProducts(results);
                console.log('[IAP] ✅ Products loaded successfully:');
                results.forEach(p => {
                    console.log(`[IAP]   - ${p.productId}: ${p.title || 'N/A'} (${p.price || 'N/A'})`);
                });
                console.log('[IAP] Total products available:', results.length);
                
                // If we got some products but not all, try legacy IDs too
                if (results.length < PRODUCT_IDS.length) {
                    console.log('[IAP] Some products missing, trying legacy IDs...');
                    try {
                        const { results: legacyResults } = await InAppPurchases.getProductsAsync(LEGACY_PRODUCT_IDS);
                        if (legacyResults && legacyResults.length > 0) {
                            setAvailableProducts(prev => [...prev, ...legacyResults]);
                            console.log('[IAP] Legacy products found:', legacyResults.map(p => p.productId).join(', '));
                        }
                    } catch (legacyError) {
                        console.warn('[IAP] Legacy products query failed:', legacyError);
                    }
                }
            } else {
                console.warn('[IAP] ⚠️ No products returned from store.');
                console.warn('[IAP] Requested product IDs:', PRODUCT_IDS.join(', '));
                console.warn('[IAP] Possible reasons:');
                console.warn('[IAP]   1. Products are "Ready to Submit" - need Sandbox test account');
                console.warn('[IAP]   2. Not signed in with Sandbox test account on device');
                console.warn('[IAP]   3. Running on simulator (IAP not available)');
                console.warn('[IAP]   4. Products need to be approved and published');
                setAvailableProducts([]);
            }
            setIapReady(true);
        } catch (error: any) {
            if (error.message && error.message.includes('Already connected')) {
                // Ignore if already connected
                // Still try to get products even if already connected
                try {
                    const { results } = await InAppPurchases.getProductsAsync(ALL_PRODUCT_IDS);
                    if (results && results.length > 0) {
                        setAvailableProducts(results);
                        console.log('[IAP] Products loaded (already connected):', results.map(p => p.productId).join(', '));
                        console.log('[IAP] Total products available:', results.length);
                    } else {
                        console.warn('[IAP] No products returned (already connected)');
                        setAvailableProducts([]);
                    }
                    setIapReady(true);
                } catch (e) {
                    console.error('[IAP] Failed to get products after connect:', e);
                    setAvailableProducts([]);
                    setIapReady(true); // Still mark as ready to prevent blocking
                }
            } else {
                console.error('[IAP] Setup Error:', error);
                setAvailableProducts([]);
                setIapReady(true); // Still mark as ready to prevent blocking
            }
        }

        try {

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

        // 1. Try to use offline data from notification payload first
        if (pAmount && pSound) {
            console.log('[ActiveAlarm] Using offline data from payload');
            setAlarm({
                id,
                userId: user!.uid,
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
            const alarms = await AlarmService.getUserAlarms(user!.uid);
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

    const handleSnoozePress = async () => {
        if (!alarm || !user) return;

        if (!iapReady) {
            Alert.alert(t('loading'), t('please_wait_iap'));
            // Try to reconnect if stuck?
            setupIAP();
            return;
        }

        setIsProcessing(true);

        const tierId = alarm.tierId; // e.g. 'com.iftsoftware.snoozetax.tier1'
        const penaltyAmount = alarm.penaltyAmount || 0;

        try {
            if (tierId) {
                // Verify product is available before purchase
                let product = availableProducts.find(p => p.productId === tierId);
                
                // If exact match not found, try to find by amount as fallback
                if (!product && availableProducts.length > 0) {
                    console.warn('[IAP] Product not found by ID, trying to find by amount:', tierId);
                    // Find the tier that matches the penalty amount
                    const matchingTier = TIERS_INFO.find(t => Math.abs(t.amount - penaltyAmount) < 0.01);
                    if (matchingTier) {
                        product = availableProducts.find(p => p.productId === matchingTier.id);
                        if (product) {
                            console.log('[IAP] Found product by amount fallback:', product.productId);
                        }
                    }
                }

                // If still not found, try any available product as last resort (for dev/testing)
                if (!product && availableProducts.length > 0) {
                    console.warn('[IAP] Using first available product as fallback');
                    product = availableProducts[0];
                }

                if (!product) {
                    const availableIds = availableProducts.map(p => p.productId).join(', ') || 'none';
                    console.error('[IAP] Product not found in available products:', {
                        requested: tierId,
                        available: availableIds,
                        availableCount: availableProducts.length
                    });
                    
                    // Try to reload products one more time
                    try {
                        const { results } = await InAppPurchases.getProductsAsync(ALL_PRODUCT_IDS);
                        if (results && results.length > 0) {
                            setAvailableProducts(results);
                            console.log('[IAP] Products reloaded, retrying...');
                            // Retry with reloaded products
                            const retryProduct = results.find(p => p.productId === tierId);
                            if (retryProduct) {
                                console.log('[IAP] Product found after reload, proceeding with purchase');
                                await InAppPurchases.purchaseItemAsync(tierId);
                                return; // Success, exit early
                            }
                        }
                    } catch (reloadError) {
                        console.error('[IAP] Failed to reload products:', reloadError);
                    }

                    // If still in dev mode, allow simulation
                    if (__DEV__) {
                        Alert.alert("Dev Mode", "Product not configured in store. Simulating purchase.", [
                            { text: "OK", onPress: () => handlePaymentSuccess() }
                        ]);
                        return;
                    }

                    Alert.alert(
                        t('error') || 'Error',
                        `Product not available. Please check your App Store/Play Store configuration.\n\nRequested: ${tierId}\nAvailable: ${availableIds || 'none'}`
                    );
                    setIsProcessing(false);
                    return;
                }

                console.log('[IAP] Purchasing product:', product.productId, product.title);
                // Attempt Real Purchase
                await InAppPurchases.purchaseItemAsync(product.productId);
                // Processing continues in setPurchaseListener
            } else {
                // Fallback if no tierId - try to infer from amount
                if (penaltyAmount > 0) {
                    const matchingTier = TIERS_INFO.find(t => Math.abs(t.amount - penaltyAmount) < 0.01);
                    if (matchingTier) {
                        const product = availableProducts.find(p => p.productId === matchingTier.id);
                        if (product) {
                            console.log('[IAP] No tierId, using inferred product from amount:', product.productId);
                            await InAppPurchases.purchaseItemAsync(product.productId);
                            return;
                        }
                    }
                }
                
                // Final fallback
                Alert.alert('Configuration Error', 'This alarm has no payment tier associated.');
                setIsProcessing(false);
            }
        } catch (error: any) {
            console.log("Purchase Error / Simulator Fallback:", error);
            // On Simulator, purchaseItemAsync throws error. We simulate success for Dev.
            if (__DEV__) {
                Alert.alert("Dev Mode", "Simulating successful purchase (IAP not available on Simulator).", [
                    { text: "OK", onPress: () => handlePaymentSuccess() }
                ]);
            } else {
                // Show actual error message for debugging
                Alert.alert('Error', `Payment could not be initiated: ${error.message || JSON.stringify(error)}`);
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
            await NotificationService.cancelAlarm('test');
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
            if (alarm.id) await NotificationService.cancelAlarm(alarm.id);
            router.replace('/(tabs)');

        } catch (error) {
            console.error(error);
            setIsProcessing(false);
        }
    };

    const handleWakeUp = async () => {
        try {
            const targetId = alarmId || alarm?.id;
            console.log(`[ActiveAlarm] User clicked I'm Up. targetId: ${targetId}`);

            // 1. Stop sound and notifications IMMEDIATELY
            await SoundService.stopSound();

            if (targetId) {
                // Suppress triggering new navigation from these cancellations
                NotificationService.suppressAlarm(targetId);
                await NotificationService.cancelAlarm(targetId);
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
