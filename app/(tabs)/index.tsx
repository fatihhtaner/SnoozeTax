import AlarmCard from '@/components/AlarmCard';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AlarmService } from '@/services/AlarmService';
import { Alarm } from '@/types/firestore';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function AlarmsScreen() {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  const loadAlarms = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const userAlarms = await AlarmService.getUserAlarms(user.uid);
      setAlarms(userAlarms);
    } catch (error) {
      console.error('Failed to load alarms', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadAlarms();
    }, [user])
  );

  const handleToggleActive = async (id: string, value: boolean) => {
    try {
      // Optimistic update
      setAlarms(prev => prev.map(a => a.id === id ? { ...a, isActive: value } : a));
      await AlarmService.updateAlarm(id, { isActive: value });
    } catch (error) {
      console.error('Failed to update alarm', error);
      loadAlarms(); // Revert on error
    }
  };

  const handlePressAlarm = (alarm: Alarm) => {
    // Navigate to editor with generic param (we'll implement params handling in editor)
    router.push({ pathname: "/alarm/editor", params: { id: alarm.id } });
  };

  const handleAddAlarm = () => {
    router.push("/alarm/editor");
  };

  const handleTestTrigger = (alarm: Alarm) => {
    // Navigate to active alarm screen to simulate trigger
    if (alarm.id) {
      router.push({ pathname: "/alarm/active", params: { alarmId: alarm.id } });
    }
  };

  if (loading && alarms.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={alarms}
        keyExtractor={(item) => item.id!}
        renderItem={({ item }) => (
          <AlarmCard
            alarm={item}
            onToggleActive={handleToggleActive}
            onPress={handlePressAlarm}
            onTestTrigger={handleTestTrigger}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.icon }]}>No alarms set. Sleep tight!</Text>
            <Text style={[styles.emptySubtext, { color: theme.icon }]}>Tap + to start paying for your sleep.</Text>
          </View>
        }
      />

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.primary }]}
        onPress={handleAddAlarm}>
        <FontAwesome name="plus" size={24} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.7,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
});
