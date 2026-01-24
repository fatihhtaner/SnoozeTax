import { Colors } from '@/constants/Colors';
import { SOUNDS } from '@/constants/Sounds';
import { useLanguage } from '@/context/LanguageContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Alarm } from '@/types/firestore';
import { FontAwesome } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import GlassCard from './GlassCard';

interface AlarmCardProps {
    alarm: Alarm;
    onToggleActive: (id: string, value: boolean) => void;
    onPress: (alarm: Alarm) => void;
    onDelete?: (alarm: Alarm) => void;
    onTestTrigger?: (alarm: Alarm) => void;
}

const DAYS = [0, 1, 2, 3, 4, 5, 6];

export default function AlarmCard({ alarm, onToggleActive, onPress, onDelete }: AlarmCardProps) {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const { t, locale } = useLanguage();

    const date = alarm.time.toDate();
    const timeString = date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });

    const activeOpacity = alarm.isActive ? 1 : 0.6;

    const handleToggle = (value: boolean) => {
        Haptics.selectionAsync();
        onToggleActive(alarm.id!, value);
    };

    const handleDelete = () => {
        if (onDelete) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            onDelete(alarm);
        }
    };

    // Common content
    const cardContent = (
        <View style={styles.cardContent}>
            {/* Header Row: Time & Switch */}
            <View style={styles.headerRow}>
                <Text style={[styles.time, { opacity: activeOpacity }]}>
                    {timeString}
                </Text>
                <Switch
                    value={alarm.isActive}
                    onValueChange={handleToggle}
                    trackColor={{ false: 'rgba(255, 255, 255, 0.2)', true: '#2EC4B6' }}
                    thumbColor={alarm.isActive ? '#CBF3F0' : 'rgba(255, 255, 255, 0.8)'}
                    ios_backgroundColor="rgba(255, 255, 255, 0.2)"
                />
            </View>

            {/* Label */}
            {alarm.label && (
                <Text style={[styles.label, { opacity: activeOpacity }]}>
                    {alarm.label}
                </Text>
            )}

            {/* Days Row */}
            <View style={styles.daysRow}>
                {DAYS.map((day) => {
                    const isSelected = alarm.repeat?.includes(day);
                    return (
                        <View
                            key={day}
                            style={[
                                styles.dayBadge,
                                isSelected && styles.dayBadgeActive,
                                { opacity: activeOpacity }
                            ]}>
                            <Text style={[
                                styles.dayText,
                                isSelected && styles.dayTextActive
                            ]}>
                                {t(`day_short_${day}`)}
                            </Text>
                        </View>
                    );
                })}
            </View>

            {/* Footer: Sound Info & Delete */}
            <View style={styles.footerRow}>
                <View style={[styles.infoRow, { opacity: activeOpacity }]}>
                    <FontAwesome name="music" size={14} color="rgba(255, 255, 255, 0.7)" />
                    <Text style={styles.infoText}>
                        {(() => {
                            const soundKey = alarm.sound || 'Classic';
                            const soundDef = SOUNDS.find(s => s.key === soundKey);
                            return soundDef ? t(soundDef.labelKey) : soundKey;
                        })()}
                    </Text>
                </View>

                {onDelete && (
                    <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={handleDelete}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <FontAwesome name="trash-o" size={20} color="rgba(255, 107, 107, 0.8)" />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

    return (
        <Animated.View
            entering={FadeInDown.delay(100).springify()}
            layout={Layout.springify()}
            style={styles.cardContainer}
        >
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => onPress(alarm)}
                style={styles.touchable}
                onLongPress={handleDelete}
            >
                <GlassCard style={styles.card}>
                    {alarm.isActive ? (
                        <LinearGradient
                            colors={['rgba(46, 196, 182, 0.3)', 'rgba(203, 243, 240, 0.2)']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={{ flex: 1 }} // Expand to fill GlassCard
                        >
                            {cardContent}
                        </LinearGradient>
                    ) : (
                        <View style={{ flex: 1 }}>
                            {cardContent}
                        </View>
                    )}
                </GlassCard>
            </TouchableOpacity>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    cardContainer: {
        marginBottom: 16,
    },
    touchable: {
        borderRadius: 24,
    },
    card: {
        padding: 0,
        overflow: 'hidden',
    },
    cardContent: {
        padding: 20,
        borderRadius: 24,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    time: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
    },
    label: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.9)',
        marginBottom: 12,
        fontWeight: '500',
    },
    daysRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 16,
    },
    dayBadge: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dayBadgeActive: {
        backgroundColor: 'rgba(46, 196, 182, 0.4)',
        borderColor: '#2EC4B6',
    },
    dayText: {
        fontSize: 12,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.6)',
    },
    dayTextActive: {
        color: '#CBF3F0',
    },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    infoText: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.7)',
    },
    deleteButton: {
        padding: 8,
        backgroundColor: 'rgba(255, 107, 107, 0.1)',
        borderRadius: 20,
    }
});
