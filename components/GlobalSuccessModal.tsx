import { useGlobalModal } from '@/context/GlobalModalContext';
import { useLanguage } from '@/context/LanguageContext';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';

export default function GlobalSuccessModal() {
    const { isVisible, hideSuccessModal } = useGlobalModal();
    const { t } = useLanguage();

    if (!isVisible) return null;

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={isVisible}
            onRequestClose={hideSuccessModal}
        >
            <View style={styles.successModalOverlay}>
                <View style={styles.successModalContent}>
                    <LinearGradient
                        colors={['#CBF3F0', '#2EC4B6']}
                        style={styles.successIconContainer}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <FontAwesome name="sun-o" size={60} color="#FFF" />
                    </LinearGradient>

                    <Text style={styles.successModalTitle}>{t('welcome') || 'Good Morning'}</Text>
                    <Text style={styles.successModalMessage}>{t('wake_up_success_msg') || 'You did it! Have a great day.'}</Text>

                    <View style={styles.celebrationContainer}>
                        <Text style={styles.celebrationEmoji}>🎉</Text>
                        <Text style={styles.celebrationEmoji}>☀️</Text>
                        <Text style={styles.celebrationEmoji}>💪</Text>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    successModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999, // Ensure it's on top
    },
    successModalContent: {
        alignItems: 'center',
        width: '100%',
        padding: 40,
    },
    successIconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 30,
        shadowColor: '#2EC4B6',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 30,
    },
    successModalTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 10,
        textAlign: 'center',
    },
    successModalMessage: {
        fontSize: 18,
        color: 'rgba(255, 255, 255, 0.7)',
        textAlign: 'center',
        marginBottom: 40,
        lineHeight: 28,
    },
    celebrationContainer: {
        flexDirection: 'row',
        gap: 20,
    },
    celebrationEmoji: {
        fontSize: 40,
    },
});
