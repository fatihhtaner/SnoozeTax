import GlassCard from '@/components/GlassCard';
import GradientBackground from '@/components/GradientBackground';
import { useLanguage } from '@/context/LanguageContext';
import { useOnboarding } from '@/context/OnboardingContext';
import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Dimensions, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function OnboardingScreen() {
    const { t } = useLanguage();
    const router = useRouter();
    const { completeOnboarding } = useOnboarding();
    const [activeIndex, setActiveIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);

    const SLIDES = [
        {
            id: '1',
            title: t('onboarding_title_1'),
            description: t('onboarding_desc_1'),
            icon: 'money', // FontAwesome name
        },
        {
            id: '2',
            title: t('onboarding_title_2'),
            description: t('onboarding_desc_2'),
            icon: 'sliders',
        },
        {
            id: '3',
            title: t('onboarding_title_3'),
            description: t('onboarding_desc_3'),
            icon: 'sun-o',
        },
    ];

    const handleNext = async () => {
        if (activeIndex < SLIDES.length - 1) {
            flatListRef.current?.scrollToIndex({
                index: activeIndex + 1,
                animated: true,
            });
        } else {
            // Finish
            try {
                await completeOnboarding();
                // No need to manually route, _layout will react to state change
            } catch (error) {
                console.error('Failed to save onboarding status', error);
            }
        }
    };

    const handleScroll = (event: any) => {
        const slideSize = event.nativeEvent.layoutMeasurement.width;
        const index = event.nativeEvent.contentOffset.x / slideSize;
        const roundIndex = Math.round(index);

        // Only update if changed prevents jitter
        if (roundIndex !== activeIndex) {
            setActiveIndex(roundIndex);
        }
    };

    return (
        <GradientBackground>
            <FlatList
                ref={flatListRef}
                data={SLIDES}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                onScroll={handleScroll}
                renderItem={({ item }) => (
                    <View style={styles.slide}>
                        <GlassCard style={styles.card}>
                            <View style={styles.iconContainer}>
                                <LinearGradient
                                    colors={['rgba(46, 196, 182, 0.2)', 'rgba(203, 243, 240, 0.1)']}
                                    style={styles.iconBackground}
                                >
                                    <FontAwesome name={item.icon as any} size={80} color="#CBF3F0" />
                                </LinearGradient>
                            </View>
                            <Text style={styles.title}>{item.title}</Text>
                            <Text style={styles.description}>{item.description}</Text>
                        </GlassCard>
                    </View>
                )}
            />

            {/* Footer with Dots and Button */}
            <View style={styles.footer}>
                <View style={styles.dotsContainer}>
                    {SLIDES.map((_, i) => (
                        <View
                            key={i}
                            style={[
                                styles.dot,
                                {
                                    backgroundColor: i === activeIndex ? '#CBF3F0' : 'rgba(255, 255, 255, 0.3)',
                                    width: i === activeIndex ? 20 : 8,
                                },
                            ]}
                        />
                    ))}
                </View>

                <TouchableOpacity
                    style={styles.button}
                    onPress={handleNext}
                >
                    <LinearGradient
                        colors={['#2EC4B6', '#CBF3F0']}
                        style={styles.gradientButton}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        <Text style={styles.buttonText}>
                            {activeIndex === SLIDES.length - 1 ? t('onboarding_start') : t('next')}
                        </Text>
                        {activeIndex !== SLIDES.length - 1 && (
                            <FontAwesome name="arrow-right" size={16} color="#0F2027" style={{ marginLeft: 10 }} />
                        )}
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </GradientBackground>
    );
}

const styles = StyleSheet.create({
    slide: {
        width, // Full screen width
        height, // Full screen height
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        paddingBottom: 150, // Space for footer
    },
    card: {
        width: '100%',
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 400,
    },
    iconContainer: {
        marginBottom: 40,
        shadowColor: '#2EC4B6',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    iconBackground: {
        width: 160,
        height: 160,
        borderRadius: 80,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 20,
    },
    description: {
        fontSize: 18,
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center',
        lineHeight: 28,
    },
    footer: {
        position: 'absolute',
        bottom: 50,
        left: 20,
        right: 20,
        alignItems: 'center',
    },
    dotsContainer: {
        flexDirection: 'row',
        marginBottom: 30,
        gap: 8,
    },
    dot: {
        height: 8,
        borderRadius: 4,
    },
    button: {
        width: '100%',
        height: 56,
        borderRadius: 28,
        shadowColor: '#2EC4B6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
        overflow: 'hidden',
    },
    gradientButton: {
        width: '100%',
        height: '100%',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        color: '#0F2027',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
