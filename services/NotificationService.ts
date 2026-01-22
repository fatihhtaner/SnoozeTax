import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure how notifications behave when the app is in foreground
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

export const NotificationService = {
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
    async scheduleAlarm(id: string, title: string, body: string, date: Date, soundName: string = 'default') {
        const trigger = date; // Timestamp trigger

        // Note: Sound handling in Expo Notifications for iOS/Android custom sounds 
        // requires the sound file to be bundled and linked properly.
        // For simplicity in this demo, we use the default sound, but the field is prepared.

        await Notifications.scheduleNotificationAsync({
            identifier: id,
            content: {
                title,
                body,
                sound: soundName === 'default' ? true : `${soundName.toLowerCase()}.wav`, // Expo often needs .wav or simple name
                data: { alarmId: id },
            },
            trigger,
        });
    },

    /**
     * Cancel a specific alarm notification.
     */
    async cancelAlarm(id: string) {
        await Notifications.cancelScheduledNotificationAsync(id);
    },

    /**
     * Cancel all notifications.
     */
    async cancelAll() {
        await Notifications.cancelAllScheduledNotificationsAsync();
    }
};
