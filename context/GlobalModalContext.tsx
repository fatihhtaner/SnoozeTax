import React, { createContext, ReactNode, useContext, useState } from 'react';

interface GlobalModalContextType {
    showSuccessModal: () => void;
    hideSuccessModal: () => void;
    isVisible: boolean;
}

const GlobalModalContext = createContext<GlobalModalContextType | undefined>(undefined);

export function GlobalModalProvider({ children }: { children: ReactNode }) {
    const [isVisible, setIsVisible] = useState(false);

    const showSuccessModal = () => {
        setIsVisible(true);
        // Auto hide after 2.5s if not hidden manually, though logic will handle it
        setTimeout(() => {
            setIsVisible(false);
        }, 2500);
    };

    const hideSuccessModal = () => {
        setIsVisible(false);
    };

    return (
        <GlobalModalContext.Provider value={{ showSuccessModal, hideSuccessModal, isVisible }}>
            {children}
        </GlobalModalContext.Provider>
    );
}

export function useGlobalModal() {
    const context = useContext(GlobalModalContext);
    if (context === undefined) {
        throw new Error('useGlobalModal must be used within a GlobalModalProvider');
    }
    return context;
}
