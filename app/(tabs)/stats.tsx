import GlassCard from '@/components/GlassCard';
import GradientBackground from '@/components/GradientBackground';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { UserService } from '@/services/UserService';
import { User } from '@/types/firestore';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function StatsScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const { user, isGuest } = useAuth();
    const { t } = useLanguage();
    const [profile, setProfile] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const loadStats = async () => {
        if (isGuest) {
            setLoading(false);
            return;
        }
        if (!user) return; // Should not happen if protected properly, but safety check

        try {
            // Only set loading if we don't have data yet to prevent layout jump
            if (!profile) setLoading(true);
            const data = await UserService.getUser(user.uid);
            setProfile(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadStats();
        }, [user])
    );

    if (loading && !profile) {
        return (
            <GradientBackground>
                <View style={[styles.container, { justifyContent: 'center' }]}>
                    <ActivityIndicator size="large" color="#CBF3F0" />
                </View>
            </GradientBackground>
        );
    }

    // Calculate some derived stats
    const totalLost = profile?.stats?.totalMoneyLost || 0;
    const totalSnoozes = profile?.stats?.totalSnoozes || 0;
    const score = profile?.stats?.disciplineScore || 100;

    return (
        <GradientBackground>
            <SafeAreaView style={{ flex: 1 }} edges={['top']}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    contentInsetAdjustmentBehavior="never"
                    showsVerticalScrollIndicator={false}
                    refreshControl={!isGuest ? <RefreshControl refreshing={loading && !profile} onRefresh={() => { setLoading(true); loadStats(); }} tintColor="#CBF3F0" /> : undefined}
                >
                    <View style={styles.header}>
                        <Text style={styles.title}>{t('dashboard_title')}</Text>
                        <Text style={styles.subtitle}>{t('dashboard_subtitle')}</Text>
                    </View>

                    {isGuest ? (
                        <GlassCard style={styles.guestStatsCard}>
                            <FontAwesome name="lock" size={40} color="rgba(255,255,255,0.6)" style={{ marginBottom: 15 }} />
                            <Text style={styles.guestStatsText}>{t('guest_stats_message') || 'Sign in to track your progress and stats'}</Text>
                        </GlassCard>
                    ) : (
                        <>
                            {/* Main Card */}
                            <GlassCard style={styles.mainCard}>
                                <LinearGradient
                                    colors={['rgba(255, 107, 107, 0.2)', 'rgba(255, 82, 82, 0.1)']}
                                    style={StyleSheet.absoluteFillObject}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                />
                                <Text style={styles.cardLabel}>{t('total_lost')}</Text>
                                <Text style={styles.cardValue}>${Number(totalLost).toFixed(2)}</Text>
                                <Text style={styles.cardSub}>{t('money_slept_away')}</Text>
                            </GlassCard>

                            {/* Grid Stats */}
                            <View style={styles.grid}>
                                <GlassCard style={styles.statBox}>
                                    <FontAwesome name="bell-o" size={24} color="#CBF3F0" style={{ marginBottom: 8 }} />
                                    <Text style={styles.statValue}>{totalSnoozes}</Text>
                                    <Text style={styles.statLabel}>{t('snoozes')}</Text>
                                </GlassCard>

                                <GlassCard style={styles.statBox}>
                                    <FontAwesome name="trophy" size={24} color="#FFD166" style={{ marginBottom: 8 }} />
                                    <Text style={styles.statValue}>{score}</Text>
                                    <Text style={styles.statLabel}>{t('score')}</Text>
                                </GlassCard>
                            </View>

                            <GlassCard style={styles.motivationBox}>
                                <Text style={styles.motivationTitle}>{t('motivation_title')}</Text>
                                <Text style={styles.motivationText}>
                                    {t('motivation_text')}
                                </Text>
                            </GlassCard>
                        </>
                    )}

                </ScrollView>
            </SafeAreaView>
        </GradientBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
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
        color: '#FFFFFF',
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.7)',
    },
    mainCard: {
        padding: 30,
        marginBottom: 20,
        alignItems: 'center',
        overflow: 'hidden',
    },
    cardLabel: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 5,
        zIndex: 1,
    },
    cardValue: {
        color: '#FF6B6B',
        fontSize: 48,
        fontWeight: 'bold',
        zIndex: 1,
        textShadowColor: 'rgba(255, 107, 107, 0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    cardSub: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 14,
        marginTop: 5,
        fontStyle: 'italic',
        zIndex: 1,
    },
    grid: {
        flexDirection: 'row',
        gap: 15,
        marginBottom: 20,
    },
    statBox: {
        flex: 1,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statValue: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    statLabel: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.7)',
    },
    motivationBox: {
        padding: 25,
        marginTop: 10,
        alignItems: 'center',
    },
    motivationTitle: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    motivationText: {
        color: '#CBF3F0',
        fontSize: 14,
        lineHeight: 20,
        textAlign: 'center',
    },
    guestStatsCard: {
        padding: 40,
        marginTop: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    guestStatsText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 16,
        textAlign: 'center',
    }
});
