import { getLocales } from 'expo-localization';
import { I18n } from 'i18n-js';

const i18n = new I18n({
    en: {
        welcome: 'Good Morning',
        snooze: 'Snooze',
        stop: 'Wake Up',
        penalty_confirm: 'Snooze for %{amount}?',
        settings: 'Settings',
    },
    tr: {
        welcome: 'Günaydın',
        snooze: 'Ertele',
        stop: 'Uyan',
        penalty_confirm: '%{amount} karşılığında ertele?',
        settings: 'Ayarlar',
    },
});

// Set the locale once at the beginning of your app.
i18n.locale = getLocales()[0]?.languageCode ?? 'en';

// When a value is missing from a language it'll fall back to another language with the key present.
i18n.enableFallback = true;

export default i18n;
