import { Colors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { UserService } from '@/services/UserService';
import { User } from '@/types/firestore';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function StatsScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const { user } = useAuth();
    const [profile, setProfile] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const loadStats = async () => {
        if (!user) return;
        try {
            setLoading(true);
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
            <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center' }]}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    // Calculate some derived stats
    const totalLost = profile?.stats.totalMoneyLost || 0;
    const totalSnoozes = profile?.stats.totalSnoozes || 0;
    const score = profile?.stats.disciplineScore || 100;

    return (
        <ScrollView
            contentContainerStyle={[styles.scrollContent, { backgroundColor: theme.background }]}
            refreshControl={<RefreshControl refreshing={loading} onRefresh={loadStats} />}
        >
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.text }]}>Dashboard</Text>
                <Text style={[styles.subtitle, { color: theme.icon }]}>Track your progress & losses.</Text>
            </View>

            {/* Main Card */}
            <LinearGradient
                colors={theme.sunriseGradient}
                style={styles.mainCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <Text style={styles.cardLabel}>TOTAL LOST</Text>
                <Text style={styles.cardValue}>${totalLost.toFixed(2)}</Text>
                <Text style={styles.cardSub}>Money literally slept away.</Text>
            </LinearGradient>

            {/* Grid Stats */}
            <View style={styles.grid}>
                <View style={[styles.statBox, { borderColor: theme.border, backgroundColor: theme.background === '#0F2027' ? '#1A2E35' : '#FFF' }]}>
                    <FontAwesome name="bell-o" size={24} color={theme.primary} style={{ marginBottom: 8 }} />
                    <Text style={[styles.statValue, { color: theme.text }]}>{totalSnoozes}</Text>
                    <Text style={[styles.statLabel, { color: theme.icon }]}>Snoozes</Text>
                </View>

                <View style={[styles.statBox, { borderColor: theme.border, backgroundColor: theme.background === '#0F2027' ? '#1A2E35' : '#FFF' }]}>
                    <FontAwesome name="trophy" size={24} color={theme.accent} style={{ marginBottom: 8 }} />
                    <Text style={[styles.statValue, { color: theme.text }]}>{score}</Text>
                    <Text style={[styles.statLabel, { color: theme.icon }]}>Score</Text>
                </View>
            </View>

            <View style={[styles.motivationBox, { backgroundColor: theme.deepBlue }]}>
                <Text style={styles.motivationTitle}>Keep going!</Text>
                <Text style={styles.motivationText}>
                    Every morning you wake up on time, you are saving money and building discipline.
                </Text>
            </View>

        </ScrollView>
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
    },
    subtitle: {
        fontSize: 16,
        opacity: 0.7,
    },
    mainCard: {
        padding: 30,
        borderRadius: 20,
        marginBottom: 20,
        shadowColor: '#FF9F1C',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
    },
    cardLabel: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 5,
    },
    cardValue: {
        color: '#FFF',
        fontSize: 48,
        fontWeight: 'bold',
    },
    cardSub: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 14,
        marginTop: 5,
        fontStyle: 'italic',
    },
    grid: {
        flexDirection: 'row',
        gap: 15,
        marginBottom: 20,
    },
    statBox: {
        flex: 1,
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statValue: {
        fontSize: 32,
        fontWeight: 'bold',
    },
    statLabel: {
        fontSize: 14,
    },
    motivationBox: {
        padding: 25,
        borderRadius: 16,
        marginTop: 10,
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
    },
});
