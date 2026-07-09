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
            // Don't show banner/list in foreground - we navigate directly to alarm screen
            shouldShowBanner: false,
            shouldShowList: false,
        }),
    });
};

// Default behavior
setNotificationBehavior(true);

// Maps a sound key to its bundled filename.
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

// Approximate duration (seconds) of each sound, used to space repeated
// notifications so the alarm rings continuously without overlap.
const SOUND_DURATION_MAP: { [key: string]: number } = {
    'Classic': 5,
    'AlarmClockBeep': 2,
    'DigitalClockBeep': 2,
    'AlarmTone': 2,
    'Alert': 5,
    'Battleship': 5,
    'CasinoJackpot': 5,
    'CasinoWin': 5,
    'CitySiren': 5,
    'ClassicShort': 2,
    'ClassicWinner': 5,
    'Critical': 3,
    'DataScanner': 2,
    'DigitalBuzzer': 5,
    'EmergencyAlert': 4,
    'FacilityAlarm': 5,
    'Facility': 4,
    'GameNotification': 2,
    'InterfaceHint': 2,
    'MorningClock': 5,
    'RetroGame': 5,
    'Rooster': 5,
    'SciFiScan': 5,
    'SecurityBreach': 5,
    'ShortRooster': 2,
    'SlotPayout': 5,
    'SlotWin': 5,
    'HallAlert': 5,
    'SpaceShooter': 5,
    'Spaceship': 5,
    'StreetPublic': 5,
    'VintageWarning': 5,
    'WarningBuzzer': 5,
};

const LONG_SOUNDS = ['Classic', 'MorningClock', 'Facility', 'SpaceShooter', 'CitySiren', 'SecurityBreach', 'VintageWarning'];

const resolveSoundFile = (soundName: string): string | boolean | undefined => {
    const soundFile = SOUND_FILENAME_MAP[soundName] || (soundName === 'default' ? true : undefined);
    if (!soundFile && soundName !== 'default') {
        console.warn(`[NotificationService] Sound mapping not found for ${soundName}. Using default.`);
        return true; // Fall back to default system sound instead of silence.
    }
    return soundFile;
};

const resolveInterval = (soundName: string): number => {
    const interval = SOUND_DURATION_MAP[soundName];
    if (interval) return interval;
    return LONG_SOUNDS.includes(soundName) ? 3 : 2;
};


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
    async scheduleAlarm(id: string, title: string, body: string, date: Date, soundName: string = 'default', extraData: any = {}, repeat: number[] = []) {
        const originalDate = new Date(date);
        const hour = originalDate.getHours();
        const minute = originalDate.getMinutes();

        // Repeating alarm: schedule one auto-repeating weekly notification per
        // selected weekday. This respects the selected days AND keeps the alarm
        // ringing on subsequent weeks without needing to re-schedule, while
        // using very few of iOS' 64 pending-notification slots.
        if (repeat && repeat.length > 0) {
            await this.scheduleWeekly(id, title, body, hour, minute, repeat, soundName, extraData);
            return;
        }

        // One-shot alarm: schedule the next occurrence (today or tomorrow) at HH:MM.
        const now = new Date();
        const triggerDate = new Date();
        triggerDate.setHours(hour);
        triggerDate.setMinutes(minute);
        triggerDate.setSeconds(0);
        triggerDate.setMilliseconds(0);

        // If the calculated time for today is in the past, schedule for tomorrow
        if (triggerDate.getTime() <= now.getTime()) {
            triggerDate.setDate(triggerDate.getDate() + 1);
        }

        const timeDiff = triggerDate.getTime() - now.getTime();
        console.log('[NotificationService] Scheduling alarm for:', triggerDate.toLocaleString(), 'in', Math.round(timeDiff / 1000), 'seconds');

        await this.scheduleSequence(id, title, body, triggerDate, soundName, extraData);
    },

    /**
     * Schedules a repeating alarm using one weekly notification per selected day.
     * `repeat` uses the app convention where 0 = Sunday ... 6 = Saturday.
     */
    async scheduleWeekly(id: string, title: string, body: string, hour: number, minute: number, repeat: number[], soundName: string = 'default', extraData: any = {}) {
        const soundFile = resolveSoundFile(soundName);
        // De-duplicate and keep only valid weekdays.
        const days = Array.from(new Set(repeat)).filter(d => d >= 0 && d <= 6);

        for (const day of days) {
            // expo-notifications weekday: 1 = Sunday ... 7 = Saturday
            const weekday = day + 1;
            const sequenceId = `${id}_day_${weekday}`;

            const trigger: Notifications.WeeklyTriggerInput = {
                type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
                weekday,
                hour,
                minute,
            };

            await Notifications.scheduleNotificationAsync({
                identifier: sequenceId,
                content: {
                    title,
                    body,
                    sound: soundFile,
                    data: { alarmId: id, ...extraData },
                    interruptionLevel: 'timeSensitive',
                    categoryIdentifier: ALARM_CATEGORY,
                },
                trigger,
            });
        }

        console.log(`[NotificationService] Scheduled weekly alarm ${id} for days [${days.join(', ')}] at ${hour}:${String(minute).padStart(2, '0')}`);
    },

    /**
     * Re-schedules the alarm to ring again after a snooze period (in minutes),
     * starting from the exact current time (not the alarm's daily HH:MM).
     */
    async scheduleSnooze(id: string, title: string, body: string, minutes: number, soundName: string = 'default', extraData: any = {}) {
        const startDate = new Date(Date.now() + minutes * 60 * 1000);
        console.log(`[NotificationService] Scheduling snooze for ${id} in ${minutes} min at ${startDate.toLocaleTimeString()}`);
        await this.scheduleSequence(id, title, body, startDate, soundName, extraData);
    },

    /**
     * Schedules a short burst of notifications starting at `startDate` to simulate a
     * continuous alarm ring. Shared by scheduleAlarm (one-shot) / scheduleSnooze.
     */
    async scheduleSequence(id: string, title: string, body: string, startDate: Date, soundName: string = 'default', extraData: any = {}) {
        const soundFile = resolveSoundFile(soundName);

        // iOS keeps at most 64 pending local notifications for the whole app.
        // A single alarm must therefore use only a small slice of that budget so
        // that multiple alarms can coexist. We cap each alarm at MAX_PINGS and
        // spread them across the ring window (continuous ringing is handled by
        // the in-app SoundService loop once the alarm screen is opened).
        const RING_WINDOW_SEC = 240; // ~4 minutes of periodic pings
        const MAX_PINGS = 12;
        const interval = Math.max(resolveInterval(soundName), Math.ceil(RING_WINDOW_SEC / MAX_PINGS));
        const count = Math.min(Math.ceil(RING_WINDOW_SEC / interval), MAX_PINGS);

        // Schedule notifications
        for (let i = 0; i < count; i++) {
            const sequenceId = `${id}_seq_${i}`;
            let notificationDate = new Date(startDate.getTime() + i * interval * 1000);

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

        // 1. Cancel one-shot / snooze burst notifications.
        // (Older builds could schedule up to 60; 200 keeps us safe against leftovers.)
        for (let i = 0; i < 200; i++) {
            const sequenceId = `${id}_seq_${i}`;
            promises.push(Notifications.cancelScheduledNotificationAsync(sequenceId));
        }

        // 2. Cancel weekly repeating notifications (one per weekday, 1..7).
        for (let d = 1; d <= 7; d++) {
            promises.push(Notifications.cancelScheduledNotificationAsync(`${id}_day_${d}`));
        }

        // 3. Dismiss any already delivered notifications (clears system tray)
        promises.push(Notifications.dismissAllNotificationsAsync());

        await Promise.all(promises);
        console.log('[NotificationService] Cancelled and dismissed all notifications for alarm:', id);
    },

    /**
     * Stops the CURRENT ring without destroying a repeating (weekly) schedule.
     * Cancels only the one-shot/snooze burst notifications and clears the tray,
     * leaving the `_day_` weekly notifications intact so a repeating alarm still
     * fires on subsequent weeks. Use this on snooze / wake-up of repeat alarms.
     */
    async dismissCurrentRing(id: string) {
        console.log('[NotificationService] Dismissing current ring (keeping repeat schedule):', id);
        this.suppressAlarm(id);

        const promises = [];
        for (let i = 0; i < 200; i++) {
            promises.push(Notifications.cancelScheduledNotificationAsync(`${id}_seq_${i}`));
        }
        promises.push(Notifications.dismissAllNotificationsAsync());

        await Promise.all(promises);
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
