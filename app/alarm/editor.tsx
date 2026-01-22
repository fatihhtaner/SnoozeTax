import GlassCard from '@/components/GlassCard';
import GradientBackground from '@/components/GradientBackground';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { AlarmService } from '@/services/AlarmService';
import { NotificationService } from '@/services/NotificationService';
import { SoundService } from '@/services/SoundService';
import { FontAwesome } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Timestamp } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const SOUNDS = [
    { key: 'Classic', labelKey: 'sound_classic' },
    { key: 'Rain', labelKey: 'sound_rain' },
    { key: 'Energize', labelKey: 'sound_energize' },
    { key: 'Forest', labelKey: 'sound_forest' },
    { key: 'Ocean', labelKey: 'sound_ocean' },
    { key: 'Piano', labelKey: 'sound_piano' },
    { key: 'AlarmClockBeep', labelKey: 'sound_alarm_clock_beep' },
    { key: 'DigitalClockBeep', labelKey: 'sound_alarm_digital_clock_beep' },
    { key: 'AlarmTone', labelKey: 'sound_alarm_tone' },
    { key: 'Alert', labelKey: 'sound_alert' },
    { key: 'Battleship', labelKey: 'sound_battleship' },
    { key: 'CasinoJackpot', labelKey: 'sound_casino_jackpot' },
    { key: 'CasinoWin', labelKey: 'sound_casino_win' },
    { key: 'CitySiren', labelKey: 'sound_city_alert' },
    { key: 'ClassicShort', labelKey: 'sound_classic_short' },
    { key: 'ClassicWinner', labelKey: 'sound_classic_winner' },
    { key: 'Critical', labelKey: 'sound_critical' },
    { key: 'DataScanner', labelKey: 'sound_data_scaner' },
    { key: 'DigitalBuzzer', labelKey: 'sound_digital_buzzer' },
    { key: 'EmergencyAlert', labelKey: 'sound_emergency_alert' },
    { key: 'FacilityAlarm', labelKey: 'sound_facility_alarm' },
    { key: 'Facility', labelKey: 'sound_facility' },
    { key: 'GameNotification', labelKey: 'sound_game_notification' },
    { key: 'InterfaceHint', labelKey: 'sound_interface_hint' },
    { key: 'MorningClock', labelKey: 'sound_morning_clock' },
    { key: 'RetroGame', labelKey: 'sound_retro_game' },
    { key: 'Rooster', labelKey: 'sound_rooster' },
    { key: 'SciFiScan', labelKey: 'sound_scanning_sci_fi' },
    { key: 'SecurityBreach', labelKey: 'sound_security_breach' },
    { key: 'ShortRooster', labelKey: 'sound_short_rooster' },
    { key: 'SlotPayout', labelKey: 'sound_slot_machine_payout' },
    { key: 'SlotWin', labelKey: 'sound_slot_machine_win' },
    { key: 'HallAlert', labelKey: 'sound_alert_hall' },
    { key: 'SpaceShooter', labelKey: 'sound_space_shooter' },
    { key: 'Spaceship', labelKey: 'sound_spaceship' },
    { key: 'StreetPublic', labelKey: 'sound_street_public' },
    { key: 'VintageWarning', labelKey: 'sound_vintage_warning' },
    { key: 'WarningBuzzer', labelKey: 'sound_warning_buzzer' },
];

// Apple App Store Connect Product IDs
// You must create these Consumable products in App Store Connect
const PENALTY_TIERS = [
    { id: 'com.anonymous.snoozetax.tier1', labelKey: 'tier_mild', emoji: '🐣', amount: 0.99, display: '$0.99' },
    { id: 'com.anonymous.snoozetax.tier2', labelKey: 'tier_medium', emoji: '😬', amount: 2.99, display: '$2.99' },
    { id: 'com.anonymous.snoozetax.tier3', labelKey: 'tier_harsh', emoji: '🔥', amount: 4.99, display: '$4.99' },
    { id: 'com.anonymous.snoozetax.tier4', labelKey: 'tier_nuclear', emoji: '💀', amount: 9.99, display: '$9.99' },
];

export default function AlarmEditorScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { user } = useAuth();
    const { t } = useLanguage();

    const [date, setDate] = useState(new Date());
    const [repeat, setRepeat] = useState<number[]>([]); // 0-6
    const [selectedTier, setSelectedTier] = useState(PENALTY_TIERS[0]); // Default to lowest
    const [label, setLabel] = useState('');
    const [sound, setSound] = useState('Classic');
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(!!id);
    const [playingSound, setPlayingSound] = useState<string | null>(null);

    useEffect(() => {
        // Request permissions on mount
        NotificationService.requestPermissions();

        return () => {
            // Cleanup sound on unmount
            SoundService.stopSound();
        };
    }, []);

    const handlePlaySound = async (soundKey: string) => {
        if (playingSound === soundKey) {
            await SoundService.stopSound();
            setPlayingSound(null);
        } else {
            setPlayingSound(soundKey);
            await SoundService.playSound(soundKey);
        }
    };

    useEffect(() => {
        if (id) {
            loadAlarm(id);
        }
    }, [id]);

    const loadAlarm = async (alarmId: string) => {
        try {
            const alarms = await AlarmService.getUserAlarms(user!.uid);
            const alarm = alarms.find(a => a.id === alarmId);
            if (alarm) {
                setDate(alarm.time.toDate());
                setRepeat(alarm.repeat);

                // Find tier by amount or ID if possible, otherwise default
                const foundTier = PENALTY_TIERS.find(p => p.amount === alarm.penaltyAmount) || PENALTY_TIERS[0];
                setSelectedTier(foundTier);

                setLabel(alarm.label || '');
                setSound(alarm.sound || 'Classic');
            }
        } catch (error) {
            Alert.alert(t('error'), t('error_load'));
        } finally {
            setFetching(false);
        }
    };

    const toggleDay = (dayIndex: number) => {
        if (repeat.includes(dayIndex)) {
            setRepeat(repeat.filter(d => d !== dayIndex));
        } else {
            setRepeat([...repeat, dayIndex].sort());
        }
    };

    const handleSave = async () => {
        if (!user) return;

        setLoading(true);
        try {
            const alarmData = {
                time: Timestamp.fromDate(date),
                repeat,
                isActive: true,
                penaltyAmount: selectedTier.amount,
                tierId: selectedTier.id, // Save the IAP Product ID
                label,
                sound,
            };

            if (id) {
                await AlarmService.updateAlarm(id, alarmData);
            } else {
                await AlarmService.addAlarm(user.uid, alarmData);
            }
            router.back();
        } catch (error) {
            Alert.alert(t('error'), t('error_save'));
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!id) return;
        Alert.alert(
            t('delete_alarm'),
            t('delete_confirm_msg'),
            [
                { text: t('cancel'), style: 'cancel' },
                {
                    text: t('delete'),
                    style: 'destructive',
                    onPress: async () => {
                        setLoading(true);
                        try {
                            await AlarmService.deleteAlarm(id);
                            router.back();
                        } catch (error) {
                            Alert.alert(t('error'), t('error_delete'));
                        }
                    }
                },
            ]
        );
    };

    if (fetching) {
        return (
            <GradientBackground>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#CBF3F0" />
                </View>
            </GradientBackground>
        );
    }

    return (
        <GradientBackground>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Custom Header */}
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <FontAwesome name="arrow-left" size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{id ? t('edit_alarm') : t('new_alarm')}</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView contentContainerStyle={styles.content}>
                    {/* Time Picker */}
                    <GlassCard style={styles.timeCard}>
                        <DateTimePicker
                            value={date}
                            mode="time"
                            display="spinner"
                            onChange={(event, selectedDate) => {
                                const currentDate = selectedDate || date;
                                setDate(currentDate);
                            }}
                            textColor="#FFFFFF"
                            style={{ height: 200 }}
                        />
                    </GlassCard>

                    {/* Penalty Tiers */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>{t('penalty_amount')}</Text>
                        <View style={styles.tiersContainer}>
                            {PENALTY_TIERS.map((tier) => (
                                <TouchableOpacity
                                    key={tier.id}
                                    style={[
                                        styles.tierButton,
                                        selectedTier.id === tier.id ? styles.tierButtonActive : styles.tierButtonInactive
                                    ]}
                                    onPress={() => setSelectedTier(tier)}
                                >
                                    <Text style={[styles.tierEmoji, { opacity: selectedTier.id === tier.id ? 1 : 0.7 }]}>
                                        {tier.emoji}
                                    </Text>
                                    <Text style={[
                                        styles.tierAmount,
                                        selectedTier.id === tier.id ? styles.textActive : styles.textInactive
                                    ]}>{tier.display}</Text>
                                    <Text style={[
                                        styles.tierLabel,
                                        selectedTier.id === tier.id ? styles.textActive : styles.textInactive
                                    ]}>{t(tier.labelKey)}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Repeat Days */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>{t('repeat')}</Text>
                        <View style={styles.daysContainer}>
                            {Array.from({ length: 7 }, (_, index) => {
                                const selected = repeat.includes(index);
                                return (
                                    <TouchableOpacity
                                        key={index}
                                        style={[
                                            styles.dayButton,
                                            {
                                                borderColor: selected ? '#CBF3F0' : 'rgba(255,255,255,0.2)',
                                                backgroundColor: selected ? '#CBF3F0' : 'rgba(255,255,255,0.1)'
                                            }
                                        ]}
                                        onPress={() => toggleDay(index)}>
                                        <Text style={{
                                            color: selected ? '#2D6A4F' : 'rgba(255,255,255,0.7)',
                                            fontWeight: selected ? 'bold' : 'normal'
                                        }}>{t(`day_short_${index}`)}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>

                    {/* Sound Selection */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>{t('sound')}</Text>
                        <View style={styles.soundContainer}>
                            {SOUNDS.map((s) => (
                                <View key={s.key} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, width: '48%' }}>
                                    <TouchableOpacity
                                        style={[
                                            styles.soundButton,
                                            sound === s.key ? styles.soundButtonActive : styles.soundButtonInactive,
                                            { flex: 1, marginRight: 8, justifyContent: 'center', alignItems: 'center' }
                                        ]}
                                        onPress={() => setSound(s.key)}
                                    >
                                        <Text style={[
                                            styles.soundText,
                                            sound === s.key ? styles.soundTextActive : styles.soundTextInactive
                                        ]}>{t(s.labelKey)}</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={{
                                            padding: 10,
                                            backgroundColor: playingSound === s.key ? 'rgba(255, 107, 107, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                                            borderRadius: 20,
                                            borderWidth: 1,
                                            borderColor: playingSound === s.key ? '#FF6B6B' : 'rgba(255, 255, 255, 0.2)'
                                        }}
                                        onPress={() => handlePlaySound(s.key)}
                                    >
                                        <FontAwesome
                                            name={playingSound === s.key ? "stop" : "play"}
                                            size={14}
                                            color={playingSound === s.key ? "#FF6B6B" : "#CBF3F0"}
                                        />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Label */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>{t('label_input')}</Text>
                        <TextInput
                            style={styles.input}
                            value={label}
                            onChangeText={setLabel}
                            placeholder={t('default_label') || "Alarm"}
                            placeholderTextColor="rgba(255,255,255,0.4)"
                        />
                    </View>

                    <TouchableOpacity
                        style={styles.saveButton}
                        onPress={handleSave}
                        disabled={loading}>
                        <LinearGradient
                            colors={['#2EC4B6', '#CBF3F0']}
                            style={styles.gradientButton}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}>
                            {loading ? <ActivityIndicator color="#0F2027" /> : <Text style={styles.saveButtonText}>{t('save_alarm')}</Text>}
                        </LinearGradient>
                    </TouchableOpacity>

                    {id && (
                        <TouchableOpacity
                            style={[styles.deleteButton, { borderColor: '#FF6B6B', backgroundColor: 'rgba(255, 107, 107, 0.1)' }]}
                            onPress={handleDelete}
                            disabled={loading}>
                            <Text style={{ color: '#FF6B6B', fontSize: 16, fontWeight: 'bold' }}>{t('delete_alarm')}</Text>
                        </TouchableOpacity>
                    )}

                    {/* Bottom Padding */}
                    <View style={{ height: 40 }} />
                </ScrollView>
            </SafeAreaView>
        </GradientBackground>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    content: {
        padding: 20,
    },
    timeCard: {
        marginBottom: 30,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
        color: '#FFFFFF',
        marginLeft: 4,
    },
    daysContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    dayButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 15,
        fontSize: 18,
        color: '#FFFFFF',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderColor: 'rgba(255,255,255,0.2)',
    },
    saveButton: {
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        marginBottom: 10,
        shadowColor: '#2EC4B6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
        overflow: 'hidden',
    },
    gradientButton: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#0F2027',
        fontSize: 18,
        fontWeight: 'bold',
    },
    deleteButton: {
        height: 50,
        borderWidth: 1,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    soundContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 10,
    },
    soundButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
        borderWidth: 1,
    },
    soundButtonActive: {
        backgroundColor: '#CBF3F0',
        borderColor: '#CBF3F0',
    },
    soundButtonInactive: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderColor: 'rgba(255,255,255,0.2)',
    },
    soundText: {
        fontSize: 14,
        fontWeight: '600',
    },
    soundTextActive: {
        color: '#2D6A4F',
    },
    soundTextInactive: {
        color: '#FFFFFF',
    },
    // Tier Styles
    tiersContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 10,
    },
    tierButton: {
        width: '48%', // 2 per row
        padding: 15,
        borderRadius: 16,
        borderWidth: 1,
        alignItems: 'center',
        marginBottom: 10,
    },
    tierButtonActive: {
        backgroundColor: '#CBF3F0',
        borderColor: '#CBF3F0',
    },
    tierButtonInactive: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderColor: 'rgba(255,255,255,0.2)',
    },
    tierEmoji: {
        fontSize: 24,
        marginBottom: 5,
    },
    tierAmount: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    tierLabel: {
        fontSize: 14,
        fontWeight: '600',
    },
    textActive: { color: '#0F2027' },
    textInactive: { color: '#FFFFFF' },
});
