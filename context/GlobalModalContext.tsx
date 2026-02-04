import React, { createContext, ReactNode, useContext, useState } from 'react';

export interface ModalContent {
    title?: string;
    message?: string;
    icon?: string; // FontAwesome icon name
}

interface GlobalModalContextType {
    showSuccessModal: (content?: ModalContent) => void;
    hideSuccessModal: () => void;
    isVisible: boolean;
    modalContent: ModalContent | null;
}

const GlobalModalContext = createContext<GlobalModalContextType | undefined>(undefined);

export function GlobalModalProvider({ children }: { children: ReactNode }) {
    const [isVisible, setIsVisible] = useState(false);
    const [modalContent, setModalContent] = useState<ModalContent | null>(null);

    const showSuccessModal = (content?: ModalContent) => {
        if (content) {
            setModalContent(content);
        } else {
            setModalContent(null); // Reset to default/null if not provided
        }
        setIsVisible(true);
        // Auto hide after 2.5s if not hidden manually, though logic will handle it
        // extended slightly to give time to read if it's a message
        setTimeout(() => {
            setIsVisible(false);
            setModalContent(null);
        }, 3500);
    };

    const hideSuccessModal = () => {
        setIsVisible(false);
        setModalContent(null);
    };

    return (
        <GlobalModalContext.Provider value={{ showSuccessModal, hideSuccessModal, isVisible, modalContent }}>
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
