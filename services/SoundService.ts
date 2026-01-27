import { AudioPlayer, createAudioPlayer } from 'expo-audio';

// Map sound keys to asset files.
// IMPORTANT: You must add these audio files to your assets/sounds/ directory.
// If the files are missing, the app will fail to build.
// specific files should be named: classic.wav, rain.wav, etc.
const soundMap: { [key: string]: any } = {
    'Classic': require('@/assets/sounds/classic.wav'),
    'AlarmClockBeep': require('@/assets/sounds/alarm-clock-beep.wav'),
    'DigitalClockBeep': require('@/assets/sounds/alarm-digital-clock-beep.wav'),
    'AlarmTone': require('@/assets/sounds/alarm-tone.wav'),
    'Alert': require('@/assets/sounds/alert.wav'),
    'Battleship': require('@/assets/sounds/battleship.wav'),
    'CasinoJackpot': require('@/assets/sounds/casino-jackpot-alarm-and-coins.wav'),
    'CasinoWin': require('@/assets/sounds/casino-win-alarm-and-coins.wav'),
    'CitySiren': require('@/assets/sounds/city-alert-siren-loop.wav'),
    'ClassicShort': require('@/assets/sounds/classic-short.wav'),
    'ClassicWinner': require('@/assets/sounds/classic-winner.wav'),
    'Critical': require('@/assets/sounds/critical.wav'),
    'DataScanner': require('@/assets/sounds/data-scaner.wav'),
    'DigitalBuzzer': require('@/assets/sounds/digital-clock-digital-alarm-buzzer.wav'),
    'EmergencyAlert': require('@/assets/sounds/emergency-alert-alarm.wav'),
    'FacilityAlarm': require('@/assets/sounds/facility-alarm-sound.wav'),
    'Facility': require('@/assets/sounds/facility.wav'),
    'GameNotification': require('@/assets/sounds/game-notification-wave.wav'),
    'InterfaceHint': require('@/assets/sounds/interface-hint-notification.wav'),
    'MorningClock': require('@/assets/sounds/morning-clock.wav'),
    'RetroGame': require('@/assets/sounds/retro-game-emergency.wav'),
    'Rooster': require('@/assets/sounds/rooster-crowing-in-the-morning.wav'),
    'SciFiScan': require('@/assets/sounds/scanning-sci-fi.wav'),
    'SecurityBreach': require('@/assets/sounds/security-facility-breach.wav'),
    'ShortRooster': require('@/assets/sounds/short-rooster-crowing.wav'),
    'SlotPayout': require('@/assets/sounds/slot-machine-payout.wav'),
    'SlotWin': require('@/assets/sounds/slot-machine-win.wav'),
    'HallAlert': require('@/assets/sounds/sound-alert-in-hall.wav'),
    'SpaceShooter': require('@/assets/sounds/space-shooter.wav'),
    'Spaceship': require('@/assets/sounds/spaceship.wav'),
    'StreetPublic': require('@/assets/sounds/street-public.wav'),
    'VintageWarning': require('@/assets/sounds/vintage-warning.wav'),
    'WarningBuzzer': require('@/assets/sounds/warning-alarm-buzzer.wav'),
};

let player: AudioPlayer | null = null;

export const SoundService = {
    /**
     * Plays a sound by name. stops any currently playing sound.
     * Configured for background playback with iOS background audio mode.
     */
    async playSound(name: string) {
        try {
            const source = soundMap[name];
            if (!source) {
                console.warn(`Sound file for ${name} not found.`);
                return;
            }

            // Remove existing player properly
            if (player) {
                player.pause();
                player.remove();
                player = null;
            }

            // Create new player
            // Note: expo-audio automatically uses background audio mode when
            // UIBackgroundModes: ["audio"] is set in app.json
            player = createAudioPlayer(source);

            player.loop = true; // Loop alarms continuously
            player.play();

        } catch (error) {
            console.error('Failed to play sound', error);
        }
    },

    /**
     * Stops the currently playing sound.
     */
    async stopSound() {
        if (player) {
            player.pause();
            player.remove();
            player = null;
        }
    }
};
