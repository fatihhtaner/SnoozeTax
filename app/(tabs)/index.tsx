import AlarmCard from '@/components/AlarmCard';
import GlassCard from '@/components/GlassCard';
import GradientBackground from '@/components/GradientBackground';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AlarmService } from '@/services/AlarmService';
import { NotificationService } from '@/services/NotificationService';
import { Alarm } from '@/types/firestore';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


import ConfirmationModal from '@/components/ConfirmationModal';

export default function AlarmsScreen() {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [alarmToDelete, setAlarmToDelete] = useState<Alarm | null>(null);

  const { user } = useAuth();
  const { t } = useLanguage();
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

  const handleAlarmPress = (alarm: Alarm) => {
    router.push({
      pathname: '/alarm/editor',
      params: { alarmId: alarm.id }
    });
  };

  const confirmDelete = async () => {
    if (!alarmToDelete || !alarmToDelete.id) return;

    try {
      setDeleteModalVisible(false);
      // Optimistic UI update
      setAlarms(prev => prev.filter(a => a.id !== alarmToDelete.id));

      await AlarmService.deleteAlarm(alarmToDelete.id);
      await NotificationService.cancelAlarm(alarmToDelete.id);
    } catch (error) {
      console.error('Delete failed', error);
      loadAlarms(); // Revert on error
      Alert.alert(t('error'), t('error_delete'));
    } finally {
      setAlarmToDelete(null);
    }
  };

  const handleDeleteAlarm = (alarm: Alarm) => {
    setAlarmToDelete(alarm);
    setDeleteModalVisible(true);
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <GlassCard style={styles.emptyCard}>
        <FontAwesome name="bell-slash-o" size={64} color="rgba(255, 255, 255, 0.6)" />
        <Text style={styles.emptyText}>{t('no_alarms')}</Text>
        <Text style={styles.emptySubtext}>{t('tap_plus_to_create')}</Text>
      </GlassCard>
    </View>
  );

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('tab_alarms')}</Text>
          <TouchableOpacity
            style={styles.testButton}
            onPress={() => router.push({ pathname: '/alarm/active', params: { alarmId: 'test' } })}
          >
            <FontAwesome name="bug" size={20} color="#CBF3F0" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#CBF3F0" />
          </View>
        ) : (
          <FlatList
            data={alarms}
            keyExtractor={(item) => item.id || Math.random().toString()}
            renderItem={({ item }) => (
              <AlarmCard
                alarm={item}
                onPress={handleAlarmPress}
                onToggleActive={handleToggleActive}
                onDelete={handleDeleteAlarm}
              />
            )}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={renderEmptyState}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* FAB - Floating Action Button */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push('/alarm/editor')}
          activeOpacity={0.8}>
          <LinearGradient
            colors={['#2EC4B6', '#CBF3F0']}
            style={styles.fabGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}>
            <FontAwesome name="plus" size={24} color="#0F2027" />
          </LinearGradient>
        </TouchableOpacity>

        <ConfirmationModal
          visible={deleteModalVisible}
          onClose={() => setDeleteModalVisible(false)}
          onConfirm={confirmDelete}
          title={t('delete_alarm')}
          message={t('delete_confirm_msg')}
          confirmText={t('delete')}
          cancelText={t('cancel')}
          destructive
        />
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  testButton: {
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 48,
    width: '100%',
  },
  emptyText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 24,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    borderRadius: 30,
    shadowColor: '#2EC4B6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  fabGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
