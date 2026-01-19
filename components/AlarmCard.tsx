import { Colors } from '@/constants/Colors';
import { useLanguage } from '@/context/LanguageContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Alarm } from '@/types/firestore';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

interface AlarmCardProps {
    alarm: Alarm;
    onToggleActive: (id: string, value: boolean) => void;
    onPress: (alarm: Alarm) => void;
    onTestTrigger?: (alarm: Alarm) => void;
}

const DAYS = [0, 1, 2, 3, 4, 5, 6];

export default function AlarmCard({ alarm, onToggleActive, onPress, onTestTrigger }: AlarmCardProps) {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const { t } = useLanguage();

    const date = alarm.time.toDate();
    const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Determine card background based on state
    const bgColors = alarm.isActive
        ? (colorScheme === 'dark' ? ['#1f4037', '#237a57'] : ['#ffffff', '#f0f9ff']) // Active: Greenish tint in dark, white/blue in light
        : (colorScheme === 'dark' ? ['#1A2E35', '#16222A'] : ['#f5f5f5', '#e0e0e0']); // Inactive: Dark grey, light grey

    const activeOpacity = alarm.isActive ? 1 : 0.6;

    return (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => onPress(alarm)}
            style={styles.cardContainer}>
            <LinearGradient
                colors={bgColors as [string, string]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.gradient, { borderColor: theme.border, borderWidth: 1 }]}
            >
                {/* Header Row: Time & Switch */}
                <View style={styles.headerRow}>
                    <Text style={[styles.time, { color: theme.text, opacity: activeOpacity }]}>
                        {timeString}
                    </Text>
                    <Switch
                        trackColor={{ false: '#767577', true: theme.primary }}
                        thumbColor={'#FFF'}
                        ios_backgroundColor="#3e3e3e"
                        onValueChange={(val) => alarm.id && onToggleActive(alarm.id, val)}
                        value={alarm.isActive}
                    />
                </View>

                {/* Sub details */}
                <View style={[styles.detailsRow, { opacity: activeOpacity }]}>
                    {alarm.label ? (
                        <Text style={[styles.label, { color: theme.icon }]}>{alarm.label}</Text>
                    ) : <View />}

                    <View style={styles.penaltyBadge}>
                        <FontAwesome name="dollar" size={12} color={theme.error} style={{ marginRight: 4 }} />
                        <Text style={[styles.penaltyText, { color: theme.error }]}>
                            {alarm.penaltyAmount.toFixed(2)} {t('penalty_label')}
                        </Text>
                    </View>
                </View>

                {/* Days Indicator */}
                <View style={[styles.daysRow, { opacity: activeOpacity }]}>
                    {DAYS.map((day) => {
                        const isSelected = alarm.repeat.includes(day);
                        return (
                            <View key={day} style={styles.dayItem}>
                                <Text style={[
                                    styles.dayText,
                                    {
                                        color: isSelected ? theme.primary : theme.icon,
                                        fontWeight: isSelected ? 'bold' : 'normal'
                                    }
                                ]}>
                                    {t(`day_short_${day}`).charAt(0)}
                                </Text>
                                {isSelected && <View style={[styles.activeDot, { backgroundColor: theme.primary }]} />}
                            </View>
                        );
                    })}
                </View>

                {onTestTrigger && (
                    <TouchableOpacity style={styles.testBtn} onPress={() => onTestTrigger(alarm)}>
                        <FontAwesome name="bell-o" size={16} color={theme.primary} />
                    </TouchableOpacity>
                )}

            </LinearGradient>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    cardContainer: {
        marginVertical: 8,
        marginHorizontal: 16,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
    gradient: {
        borderRadius: 20,
        padding: 20,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    time: {
        fontSize: 42,
        fontWeight: 'bold', // Stronger font
        letterSpacing: -1,
    },
    detailsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
    },
    penaltyBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(230, 57, 70, 0.1)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    penaltyText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    daysRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 5,
    },
    dayItem: {
        alignItems: 'center',
        width: 30,
    },
    dayText: {
        fontSize: 12,
        marginBottom: 4,
    },
    activeDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
    },
    testBtn: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        opacity: 0.5
    }
});
