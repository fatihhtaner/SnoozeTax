import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

type OnboardingContextType = {
    hasSeenOnboarding: boolean | null;
    checkOnboarding: () => Promise<void>;
    completeOnboarding: () => Promise<void>;
};

const OnboardingContext = createContext<OnboardingContextType>({
    hasSeenOnboarding: null,
    checkOnboarding: async () => { },
    completeOnboarding: async () => { },
});

export const useOnboarding = () => useContext(OnboardingContext);

export const OnboardingProvider = ({ children }: { children: React.ReactNode }) => {
    const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);

    const checkOnboarding = async () => {
        try {
            const value = await AsyncStorage.getItem('hasSeenOnboarding');
            setHasSeenOnboarding(value === 'true');
        } catch (error) {
            console.error('Failed to check onboarding status', error);
            setHasSeenOnboarding(false);
        }
    };

    const completeOnboarding = async () => {
        try {
            await AsyncStorage.setItem('hasSeenOnboarding', 'true');
            setHasSeenOnboarding(true);
        } catch (error) {
            console.error('Failed to complete onboarding', error);
        }
    };

    useEffect(() => {
        checkOnboarding();
    }, []);

    return (
        <OnboardingContext.Provider
            value={{
                hasSeenOnboarding,
                checkOnboarding,
                completeOnboarding,
            }}
        >
            {children}
        </OnboardingContext.Provider>
    );
};
