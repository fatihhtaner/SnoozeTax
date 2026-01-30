import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Define Actions
const SNOOZE_ACTION = 'SNOOZE_ACTION';
const WAKE_UP_ACTION = 'WAKE_UP_ACTION';
const ALARM_CATEGORY = 'ALARM_CATEGORY';

// Configure how notifications behave when the app is in foreground
const setNotificationBehavior = (shouldPlaySound: boolean) => {
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldPlaySound: shouldPlaySound,
            shouldSetBadge: false,
            shouldShowBanner: shouldPlaySound,
            shouldShowList: shouldPlaySound,
        }),
    });
};

// Default behavior
setNotificationBehavior(true);




export const NotificationService = {
    /**
     * Set of suppressed alarm IDs.
     * We use this to briefly ignore notifications for alarms that were just stopped,
     * preventing race conditions where a lingering scheduled notification triggers navigation.
     */
    suppressedAlarms: new Set<string>(),

    /**
     * Suppress an alarm ID for a short duration.
     */
    suppressAlarm(id: string) {
        console.log(`[NotificationService] Suppressing alarm ${id} to prevent loop.`);
        this.suppressedAlarms.add(id);
        // Auto-remove after 10 seconds (enough time for all scheduled pings to fire/cancel)
        setTimeout(() => {
            this.suppressedAlarms.delete(id);
            console.log(`[NotificationService] Un-suppressed alarm ${id}.`);
        }, 10000);
    },

    /**
     * Check if an alarm is currently suppressed.
     */
    isSuppressed(id: string): boolean {
        return this.suppressedAlarms.has(id);
    },

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
    async scheduleAlarm(id: string, title: string, body: string, date: Date, soundName: string = 'default', extraData: any = {}) {
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

        const SOUND_FILENAME_MAP: { [key: string]: string } = {
            'Classic': 'classic.wav',
            'AlarmClockBeep': 'alarm-clock-beep.wav',
            'DigitalClockBeep': 'alarm-digital-clock-beep.wav',
            'AlarmTone': 'alarm-tone.wav',
            'Alert': 'alert.wav',
            'Battleship': 'battleship.wav',
            'CasinoJackpot': 'casino-jackpot-alarm-and-coins.wav',
            'CasinoWin': 'casino-win-alarm-and-coins.wav',
            'CitySiren': 'city-alert-siren-loop.wav',
            'ClassicShort': 'classic-short.wav',
            'ClassicWinner': 'classic-winner.wav',
            'Critical': 'critical.wav',
            'DataScanner': 'data-scaner.wav',
            'DigitalBuzzer': 'digital-clock-digital-alarm-buzzer.wav',
            'EmergencyAlert': 'emergency-alert-alarm.wav',
            'FacilityAlarm': 'facility-alarm-sound.wav',
            'Facility': 'facility.wav',
            'GameNotification': 'game-notification-wave.wav',
            'InterfaceHint': 'interface-hint-notification.wav',
            'MorningClock': 'morning-clock.wav',
            'RetroGame': 'retro-game-emergency.wav',
            'Rooster': 'rooster-crowing-in-the-morning.wav',
            'SciFiScan': 'scanning-sci-fi.wav',
            'SecurityBreach': 'security-facility-breach.wav',
            'ShortRooster': 'short-rooster-crowing.wav',
            'SlotPayout': 'slot-machine-payout.wav',
            'SlotWin': 'slot-machine-win.wav',
            'HallAlert': 'sound-alert-in-hall.wav',
            'SpaceShooter': 'space-shooter.wav',
            'Spaceship': 'spaceship.wav',
            'StreetPublic': 'street-public.wav',
            'VintageWarning': 'vintage-warning.wav',
            'WarningBuzzer': 'warning-alarm-buzzer.wav',
        };

        const soundFile = SOUND_FILENAME_MAP[soundName] || (soundName === 'default' ? true : undefined);

        if (!soundFile && soundName !== 'default') {
            console.warn(`[NotificationService] Sound mapping not found for ${soundName}. Using default.`);
        }

        const SOUND_DURATION_MAP: { [key: string]: number } = {
            'Classic': 30, // Loop is ~28-30s effectively
            'AlarmClockBeep': 2,
            'DigitalClockBeep': 2,
            'AlarmTone': 2,
            'Alert': 5,
            'Battleship': 30,
            'CasinoJackpot': 15,
            'CasinoWin': 15,
            'CitySiren': 30,
            'ClassicShort': 2,
            'ClassicWinner': 5,
            'Critical': 3,
            'DataScanner': 2,
            'DigitalBuzzer': 5,
            'EmergencyAlert': 4,
            'FacilityAlarm': 15,
            'Facility': 4,
            'GameNotification': 2,
            'InterfaceHint': 2,
            'MorningClock': 10,
            'RetroGame': 20,
            'Rooster': 5,
            'SciFiScan': 15,
            'SecurityBreach': 5,
            'ShortRooster': 2,
            'SlotPayout': 5,
            'SlotWin': 5,
            'HallAlert': 15,
            'SpaceShooter': 8,
            'Spaceship': 30,
            'StreetPublic': 5,
            'VintageWarning': 8,
            'WarningBuzzer': 5,
        };

        // Determine interval based on sound duration to prevent overlap
        // If sound is defined in map, use its duration. 
        // fallback: 3s for known long sounds, 2s for others (original logic safety net)

        // Check if it's a known long sound irrespective of map (legacy check)
        const LONG_SOUNDS = ['Classic', 'MorningClock', 'Facility', 'SpaceShooter', 'CitySiren', 'SecurityBreach', 'VintageWarning'];
        const isLongSound = LONG_SOUNDS.includes(soundName);

        let interval = SOUND_DURATION_MAP[soundName];
        if (!interval) {
            interval = isLongSound ? 3 : 2;
        }

        const totalDuration = 300; // 5 minutes total
        const count = Math.min(Math.ceil(totalDuration / interval), 60); // Cap at 60

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
                    data: { alarmId: id, ...extraData },
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
        console.log('[NotificationService] Cancelling alarm:', id);

        // IMMEDIATE suppression to block listeners
        this.suppressAlarm(id);

        // Cancel all potential sequence notifications in parallel for speed
        const promises = [];

        // 1. Cancel scheduled notifications
        // Max possible count is 150 (300s / 2s interval)
        // Using 200 to be safe
        for (let i = 0; i < 200; i++) {
            const sequenceId = `${id}_seq_${i}`;
            promises.push(Notifications.cancelScheduledNotificationAsync(sequenceId));
        }

        // 2. Dismiss any already delivered notifications (clears system tray)
        promises.push(Notifications.dismissAllNotificationsAsync());

        await Promise.all(promises);
        console.log('[NotificationService] Cancelled and dismissed all notifications for alarm:', id);
    },

    /**
     * Update foreground notification behavior (e.g. silence sound when valid alarm screen is active)
     */
    setForegroundBehavior(shouldPlaySound: boolean) {
        setNotificationBehavior(shouldPlaySound);
    },

    /**
     * Cancel all notifications.
     */
    async cancelAll() {
        await Notifications.cancelAllScheduledNotificationsAsync();
        await Notifications.dismissAllNotificationsAsync();
    },

};
