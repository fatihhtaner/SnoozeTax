import React, { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

interface GlassCardProps {
    children: ReactNode;
    style?: ViewStyle;
    padding?: number;
}

export default function GlassCard({ children, style, padding = 24 }: GlassCardProps) {
    return (
        <View style={[styles.card, { padding }, style]}>
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 24,
        backdropFilter: 'blur(10px)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
});
