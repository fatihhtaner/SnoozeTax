import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Alarm } from '@/types/firestore';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import React from 'react';
import { StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

interface AlarmCardProps {
    alarm: Alarm;
    onToggleActive: (id: string, value: boolean) => void;
    onPress: (alarm: Alarm) => void;
    onTestTrigger?: (alarm: Alarm) => void; // Added for testing
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function AlarmCard({ alarm, onToggleActive, onPress, onTestTrigger }: AlarmCardProps) {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    // Format time from timestamp
    const date = alarm.time.toDate();
    const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Format repeat days
    const repeatString = alarm.repeat.length === 7
        ? 'Every day'
        : alarm.repeat.length === 0
            ? 'Once'
            : alarm.repeat.map(d => DAYS[d]).join(', ');

    return (
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => onPress(alarm)}
            style={[styles.card, { backgroundColor: theme.background === '#0F2027' ? '#1A2E35' : '#FFFFFF', borderColor: theme.border, borderWidth: 1 }]}>

            <View style={styles.infoContainer}>
                <Text style={[styles.time, { color: theme.text, opacity: alarm.isActive ? 1 : 0.5 }]}>
                    {timeString}
                </Text>
                <Text style={[styles.days, { color: theme.icon }]}>
                    {repeatString}
                </Text>
                {alarm.label && (
                    <Text style={[styles.label, { color: theme.icon }]}>{alarm.label}</Text>
                )}
                <Text style={[styles.penalty, { color: theme.error }]}>
                    Penalty: ${alarm.penaltyAmount.toFixed(2)}
                </Text>
            </View>

            <View style={{ alignItems: 'flex-end', gap: 10 }}>
                <Switch
                    trackColor={{ false: '#767577', true: theme.primary }}
                    thumbColor={'#f4f3f4'}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={(val) => {
                        if (alarm.id) {
                            onToggleActive(alarm.id, val);
                        }
                    }}
                    value={alarm.isActive}
                />
                {/* Test Button for easy debugging */}
                {onTestTrigger && (
                    <TouchableOpacity onPress={() => onTestTrigger(alarm)}>
                        <FontAwesome name="bell-o" size={20} color={theme.primary} />
                    </TouchableOpacity>
                )}
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        marginVertical: 8,
        marginHorizontal: 16,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    infoContainer: {
        flex: 1,
    },
    time: {
        fontSize: 32,
        fontWeight: '300', // Thin, elegant font
        marginBottom: 4,
    },
    days: {
        fontSize: 14,
        marginBottom: 4,
    },
    label: {
        fontSize: 14,
        fontStyle: 'italic',
        marginBottom: 4,
    },
    penalty: {
        fontSize: 12,
        fontWeight: 'bold',
    },
});
