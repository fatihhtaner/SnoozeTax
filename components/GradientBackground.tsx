import { LinearGradient } from 'expo-linear-gradient';
import React, { ReactNode } from 'react';
import { ImageBackground, StyleSheet } from 'react-native';
import StarBackground from './StarBackground';

interface GradientBackgroundProps {
    children: ReactNode;
    hasStars?: boolean;
}

export default function GradientBackground({ children, hasStars = true }: GradientBackgroundProps) {
    return (
        <ImageBackground
            source={require('@/assets/images/login-bg.png')}
            style={styles.backgroundImage}
            resizeMode="cover">
            <LinearGradient
                colors={['#162046', '#0F1428', '#0A0E1E']}
                style={styles.gradient}>
                {hasStars && <StarBackground />}
                {children}
            </LinearGradient>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    gradient: {
        flex: 1,
    },
});
