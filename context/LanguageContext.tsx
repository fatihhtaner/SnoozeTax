import { i18n } from '@/i18n/i18n'; // You might need to adjust export in i18n.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

type Language = 'en' | 'tr' | 'de' | 'fr' | 'es';

interface LanguageContextType {
    locale: Language;
    setLocale: (startLang: Language) => Promise<void>;
    t: (scope: string, options?: any) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
    const [locale, setLocaleState] = useState<Language>('en');

    useEffect(() => {
        const loadLanguage = async () => {
            const stored = await AsyncStorage.getItem('user-language');
            if (stored) {
                setLocaleState(stored as Language);
                i18n.locale = stored;
            } else {
                // Default initialized in i18n.ts, verify consistency
                setLocaleState(i18n.locale as Language || 'en');
            }
        };
        loadLanguage();
    }, []);

    const setLocale = async (newLocale: Language) => {
        i18n.locale = newLocale;
        setLocaleState(newLocale);
        await AsyncStorage.setItem('user-language', newLocale);
    };

    const t = (scope: string, options?: any) => i18n.t(scope, { locale, ...options });

    return (
        <LanguageContext.Provider value={{ locale, setLocale, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
    return context;
};
