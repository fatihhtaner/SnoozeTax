import { LinearGradient } from 'expo-linear-gradient';
import React, { ReactNode } from 'react';
import { ImageBackground, StyleSheet } from 'react-native';
import StarBackground from './StarBackground';

interface GradientBackgroundProps {
    children: ReactNode;
}

export default function GradientBackground({ children }: GradientBackgroundProps) {
    return (
        <ImageBackground
            source={require('@/assets/images/login-bg.png')}
            style={styles.backgroundImage}
            resizeMode="cover">
            <StarBackground />
            <LinearGradient
                colors={['rgba(15, 32, 39, 0.8)', 'rgba(44, 83, 100, 0.9)', 'rgba(32, 58, 67, 0.85)']}
                style={styles.gradient}>
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
