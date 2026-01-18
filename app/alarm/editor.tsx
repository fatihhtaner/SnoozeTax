import { Colors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AlarmService } from '@/services/AlarmService';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Timestamp } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function AlarmEditorScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { user } = useAuth();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    const [date, setDate] = useState(new Date());
    const [repeat, setRepeat] = useState<number[]>([]); // 0-6
    const [penalty, setPenalty] = useState('1.00');
    const [label, setLabel] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(!!id);

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
                setPenalty(alarm.penaltyAmount.toString());
                setLabel(alarm.label || '');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to load alarm');
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

        const penaltyAmount = parseFloat(penalty);
        if (isNaN(penaltyAmount) || penaltyAmount < 0) {
            Alert.alert('Invalid Penalty', 'Please enter a valid amount.');
            return;
        }

        setLoading(true);
        try {
            const alarmData = {
                time: Timestamp.fromDate(date),
                repeat,
                isActive: true,
                penaltyAmount,
                label,
            };

            if (id) {
                await AlarmService.updateAlarm(id, alarmData);
            } else {
                await AlarmService.addAlarm(user.uid, alarmData);
            }
            router.back();
        } catch (error) {
            Alert.alert('Error', 'Failed to save alarm');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!id) return;
        Alert.alert(
            'Delete Alarm',
            'Are you sure?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        setLoading(true);
                        try {
                            await AlarmService.deleteAlarm(id);
                            router.back();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete alarm');
                        }
                    }
                },
            ]
        );
    };

    if (fetching) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center' }]}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Stack.Screen options={{
                title: id ? 'Edit Alarm' : 'New Alarm',
                headerBackTitle: 'Cancel',
                headerTintColor: theme.primary,
                headerStyle: { backgroundColor: theme.background },
                headerRight: () => (
                    <TouchableOpacity onPress={handleSave} disabled={loading}>
                        <Text style={{ color: theme.primary, fontWeight: 'bold', fontSize: 17 }}>Save</Text>
                    </TouchableOpacity>
                )
            }} />

            <ScrollView contentContainerStyle={styles.content}>
                {/* Time Picker */}
                <View style={styles.timeContainer}>
                    <DateTimePicker
                        value={date}
                        mode="time"
                        display="spinner"
                        onChange={(event, selectedDate) => {
                            const currentDate = selectedDate || date;
                            setDate(currentDate);
                        }}
                        textColor={theme.text}
                        style={{ height: 200 }}
                    />
                </View>

                {/* Repeat Days */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Repeat</Text>
                    <View style={styles.daysContainer}>
                        {DAYS.map((day, index) => {
                            const selected = repeat.includes(index);
                            return (
                                <TouchableOpacity
                                    key={day}
                                    style={[
                                        styles.dayButton,
                                        {
                                            borderColor: theme.border,
                                            backgroundColor: selected ? theme.primary : 'transparent'
                                        }
                                    ]}
                                    onPress={() => toggleDay(index)}>
                                    <Text style={{ color: selected ? '#FFF' : theme.text }}>{day.charAt(0)}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* Penalty */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Penalty Amount ($)</Text>
                    <TextInput
                        style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background === '#0F2027' ? '#1A2E35' : '#FFF' }]}
                        value={penalty}
                        onChangeText={setPenalty}
                        keyboardType="numeric"
                        placeholder="0.00"
                        placeholderTextColor={theme.icon}
                    />
                    <Text style={[styles.hint, { color: theme.icon }]}>Cost per snooze button tap.</Text>
                </View>

                {/* Label */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Label</Text>
                    <TextInput
                        style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background === '#0F2027' ? '#1A2E35' : '#FFF' }]}
                        value={label}
                        onChangeText={setLabel}
                        placeholder="Alarm"
                        placeholderTextColor={theme.icon}
                    />
                </View>

                {id && (
                    <TouchableOpacity
                        style={[styles.deleteButton, { borderColor: theme.error }]}
                        onPress={handleDelete}
                        disabled={loading}>
                        <Text style={{ color: theme.error, fontSize: 16 }}>Delete Alarm</Text>
                    </TouchableOpacity>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 20,
    },
    timeContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
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
    },
    hint: {
        marginTop: 6,
        fontSize: 12,
    },
    deleteButton: {
        height: 50,
        borderWidth: 1,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
});
