import FontAwesome from '@expo/vector-icons/FontAwesome';
import React, { ReactNode } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import GlassCard from './GlassCard';

interface GlassModalProps {
    visible: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
    height?: number | string;
    maxHeight?: number | string;
}

export default function GlassModal({
    visible,
    onClose,
    title,
    children,
    height,
    maxHeight = '80%'
}: GlassModalProps) {
    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <GlassCard style={[styles.container, { height: height as any, maxHeight: maxHeight as any }]}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>{title}</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <FontAwesome name="close" size={20} color="rgba(255,255,255,0.6)" />
                        </TouchableOpacity>
                    </View>

                    {/* Content */}
                    <View style={styles.content}>
                        {children}
                    </View>
                </GlassCard>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        padding: 20,
    },
    container: {
        width: '100%',
        padding: 0,
        backgroundColor: '#1E293B',
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    closeButton: {
        padding: 5,
    },
    content: {
        padding: 20,
    },
});
