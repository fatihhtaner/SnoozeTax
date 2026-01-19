import CustomHeader from '@/components/CustomHeader';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AlarmService } from '@/services/AlarmService';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Timestamp } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const SOUNDS = ['Classic', 'Rain', 'Energize'];

export default function AlarmEditorScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { user } = useAuth();
    const { t } = useLanguage();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    const [date, setDate] = useState(new Date());
    const [repeat, setRepeat] = useState<number[]>([]); // 0-6
    const [penalty, setPenalty] = useState('1.00');
    const [label, setLabel] = useState('');
    const [sound, setSound] = useState('Classic');
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

        const penaltyAmount = parseFloat(penalty);
        if (isNaN(penaltyAmount) || penaltyAmount < 0) {
            Alert.alert(t('invalid_penalty'), t('invalid_penalty_msg'));
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
            <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center' }]}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <CustomHeader title={id ? t('edit_alarm') : t('new_alarm')} showBack={true} />

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
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('repeat')}</Text>
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

                {/* Sound Selection */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('sound')}</Text>
                    <View style={styles.soundContainer}>
                        {SOUNDS.map((s) => (
                            <TouchableOpacity
                                key={s}
                                style={[
                                    styles.soundButton,
                                    sound === s && { backgroundColor: theme.primary, borderColor: theme.primary }
                                ]}
                                onPress={() => setSound(s)}
                            >
                                <Text style={[
                                    styles.soundText,
                                    { color: sound === s ? '#FFF' : theme.text }
                                ]}>{s}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Penalty */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('penalty_amount')}</Text>
                    <TextInput
                        style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background === '#0F2027' ? '#1A2E35' : '#FFF' }]}
                        value={penalty}
                        onChangeText={setPenalty}
                        keyboardType="numeric"
                        placeholder="0.00"
                        placeholderTextColor={theme.icon}
                    />
                    <Text style={[styles.hint, { color: theme.icon }]}>{t('penalty_hint')}</Text>
                </View>

                {/* Label */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('label_input')}</Text>
                    <TextInput
                        style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background === '#0F2027' ? '#1A2E35' : '#FFF' }]}
                        value={label}
                        onChangeText={setLabel}
                        placeholder={t('default_label')} // Will error if default_label missing, I missed adding it to i18n instructions above but maybe existing 'Alarm' will do. logic below
                        placeholderTextColor={theme.icon}
                    />
                </View>

                <TouchableOpacity
                    style={[styles.saveButton, { backgroundColor: theme.primary }]}
                    onPress={handleSave}
                    disabled={loading}
                >
                    {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveButtonText}>{t('save_alarm')}</Text>}
                </TouchableOpacity>

                {id && (
                    <TouchableOpacity
                        style={[styles.deleteButton, { borderColor: theme.error }]}
                        onPress={handleDelete}
                        disabled={loading}>
                        <Text style={{ color: theme.error, fontSize: 16 }}>{t('delete_alarm')}</Text>
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
    saveButton: {
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 4,
    },
    saveButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    deleteButton: {
        height: 50,
        borderWidth: 1,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    soundContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    soundButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#ccc',
    },
    soundText: {
        fontSize: 14,
        fontWeight: '500',
    },
});
