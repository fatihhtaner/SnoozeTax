import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

interface Star {
    id: number;
    left: string;
    top: string;
    size: number;
    duration: number;
    delay: number;
}

export default function StarBackground() {
    // Generate random stars
    const stars: Star[] = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size: Math.random() * 3 + 1,
        duration: Math.random() * 3000 + 2000,
        delay: Math.random() * 2000,
    }));

    return (
        <View style={styles.container}>
            {stars.map((star) => (
                <TwinklingStar key={star.id} star={star} />
            ))}
        </View>
    );
}

function TwinklingStar({ star }: { star: Star }) {
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const animate = () => {
            Animated.sequence([
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: star.duration / 2,
                    easing: Easing.ease,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0,
                    duration: star.duration / 2,
                    easing: Easing.ease,
                    useNativeDriver: true,
                }),
            ]).start(() => animate());
        };

        const timeout = setTimeout(animate, star.delay);
        return () => clearTimeout(timeout);
    }, []);

    return (
        <Animated.View
            style={[
                styles.star,
                {
                    left: star.left,
                    top: star.top,
                    width: star.size,
                    height: star.size,
                    opacity,
                } as any,
            ]}
        />
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 0,
    },
    star: {
        position: 'absolute',
        backgroundColor: '#FFFFFF',
        borderRadius: 50,
        shadowColor: '#FFFFFF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
    },
});
