import { useColorScheme } from '@/hooks/use-color-scheme';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import GlassCard from './GlassCard';

interface ConfirmationModalProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    loading?: boolean;
    destructive?: boolean;
}

export default function ConfirmationModal({
    visible,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    loading = false,
    destructive = false
}: ConfirmationModalProps) {
    const colorScheme = useColorScheme();

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <GlassCard style={styles.container}>
                    {/* Icon */}
                    <View style={[styles.iconContainer, destructive ? styles.iconDestructive : styles.iconNormal]}>
                        <FontAwesome name={destructive ? "trash-o" : "question"} size={32} color="#FFF" />
                    </View>

                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.message}>{message}</Text>

                    <View style={styles.buttonRow}>
                        <TouchableOpacity style={styles.cancelButton} onPress={onClose} disabled={loading}>
                            <Text style={styles.cancelText}>{cancelText}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.confirmButton, destructive ? styles.confirmDestructive : styles.confirmNormal]}
                            onPress={onConfirm}
                            disabled={loading}
                        >
                            {destructive ? (
                                <View style={styles.buttonContent}>
                                    <Text style={styles.confirmText}>{confirmText}</Text>
                                </View>
                            ) : (
                                <LinearGradient
                                    colors={['#2EC4B6', '#CBF3F0']}
                                    style={styles.gradient}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}>
                                    <Text style={[styles.confirmText, { color: '#0F2027' }]}>{confirmText}</Text>
                                </LinearGradient>
                            )}
                        </TouchableOpacity>
                    </View>
                </GlassCard>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    container: {
        width: '100%',
        maxWidth: 340,
        alignItems: 'center',
        padding: 30,
        backgroundColor: '#1E293B',
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    iconDestructive: {
        backgroundColor: 'rgba(255, 107, 107, 0.1)',
        borderColor: 'rgba(255, 107, 107, 0.3)',
    },
    iconNormal: {
        backgroundColor: 'rgba(46, 196, 182, 0.1)',
        borderColor: 'rgba(46, 196, 182, 0.3)',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 10,
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.7)',
        textAlign: 'center',
        marginBottom: 30,
        lineHeight: 22,
    },
    buttonRow: {
        flexDirection: 'row',
        width: '100%',
        gap: 15,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    confirmButton: {
        flex: 1,
        borderRadius: 12,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
    },
    confirmDestructive: {
        backgroundColor: 'rgba(255, 107, 107, 0.2)', // More distinct "Red" look
        borderWidth: 1,
        borderColor: 'rgba(255, 107, 107, 0.4)',
        paddingVertical: 14,
    },
    confirmNormal: {
        height: 50,
    },
    buttonContent: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    gradient: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    confirmText: {
        color: '#FF6B6B',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
