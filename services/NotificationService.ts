import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure how notifications behave when the app is in foreground
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

// Define Actions
const SNOOZE_ACTION = 'SNOOZE_ACTION';
const WAKE_UP_ACTION = 'WAKE_UP_ACTION';
const ALARM_CATEGORY = 'ALARM_CATEGORY';


export const NotificationService = {
    /**
     * Setup notification categories with localized button titles.
     */
    async setupNotificationCategories(snoozeTitle: string, wakeUpTitle: string) {
        await Notifications.setNotificationCategoryAsync(ALARM_CATEGORY, [
            {
                identifier: SNOOZE_ACTION,
                buttonTitle: snoozeTitle,
                options: {
                    opensAppToForeground: true,
                },
            },
            {
                identifier: WAKE_UP_ACTION,
                buttonTitle: wakeUpTitle,
                options: {
                    opensAppToForeground: true,
                },
            },
        ]);
    },
    /**
     * Request permissions for notifications.
     */
    async requestPermissions() {
        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        }

        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            return false;
        }

        return true;
    },

    /**
     * Schedule a local notification (alarm).
     */
    /**
     * Schedule a local notification (alarm).
     * Schedules a sequence of notifications to simulate a continuous alarm.
     */
    async scheduleAlarm(id: string, title: string, body: string, date: Date, soundName: string = 'default') {
        // Ensure date is in the future
        let triggerDate = new Date(date);
        const now = Date.now();
        const timeDiff = triggerDate.getTime() - now;

        // Only move to tomorrow if alarm is more than 1 minute in the past
        // This allows alarms set for "right now" or very soon to still trigger
        if (timeDiff < -60000) { // -60 seconds
            triggerDate.setDate(triggerDate.getDate() + 1);
            console.log('[NotificationService] Alarm was in the past, moved to tomorrow:', triggerDate);
        } else if (timeDiff < 0) {
            // If alarm is in the very recent past (< 1 min), schedule for now + 5 seconds
            triggerDate = new Date(now + 5000);
            console.log('[NotificationService] Alarm was just now, scheduling for 5 seconds from now');
        } else {
            console.log('[NotificationService] Scheduling alarm for:', triggerDate, 'in', Math.round(timeDiff / 1000), 'seconds');
        }

        const soundFile = soundName === 'default' ? true : `${soundName.toLowerCase()}.wav`;

        // Determine interval based on sound duration to prevent overlap or silence
        // Reduced intervals for more continuous alarm experience
        const LONG_SOUNDS = ['Classic', 'MorningClock', 'Facility', 'SpaceShooter', 'CitySiren', 'SecurityBreach', 'VintageWarning'];
        const isLongSound = LONG_SOUNDS.includes(soundName);

        const interval = isLongSound ? 3 : 2; // 3s for long, 2s for short (more frequent)
        const totalDuration = 300; // 5 minutes total
        const count = Math.ceil(totalDuration / interval);

        // Schedule notifications
        for (let i = 0; i < count; i++) {
            const sequenceId = `${id}_seq_${i}`;
            let notificationDate = new Date(triggerDate.getTime() + i * interval * 1000);

            // Safety check: ensure the date is effectively in the future
            if (notificationDate.getTime() <= Date.now()) {
                notificationDate = new Date(Date.now() + 1000 + (i * 1000));
            }

            const trigger: Notifications.DateTriggerInput = {
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date: notificationDate,
            };

            await Notifications.scheduleNotificationAsync({
                identifier: sequenceId,
                content: {
                    title: i === 0 ? title : `${title} (Devam Ediyor)`,
                    body: body,
                    sound: soundFile,
                    data: { alarmId: id },
                    interruptionLevel: 'timeSensitive',
                    categoryIdentifier: ALARM_CATEGORY,
                },
                trigger,
            });
        }
    },

    /**
     * Cancel a specific alarm notification sequence.
     */
    /**
     * Cancel a specific alarm notification sequence.
     */
    async cancelAlarm(id: string) {
        // Cancel all potential sequence notifications in parallel for speed
        const promises = [];
        // Max possible count is 60 (if interval was 5s)
        for (let i = 0; i < 60; i++) {
            const sequenceId = `${id}_seq_${i}`;
            promises.push(Notifications.cancelScheduledNotificationAsync(sequenceId));
        }
        await Promise.all(promises);
    },

    /**
     * Cancel all notifications.
     */
    async cancelAll() {
        await Notifications.cancelAllScheduledNotificationsAsync();
    }
};
