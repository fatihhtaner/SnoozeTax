import GlassCard from '@/components/GlassCard';
import GradientBackground from '@/components/GradientBackground';
import { useGlobalModal } from '@/context/GlobalModalContext';
import { useLanguage } from '@/context/LanguageContext';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { Easing, FadeInDown, ZoomIn } from 'react-native-reanimated';

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
            <GradientBackground hasStars={false}>
                <View style={styles.container}>
                    <Animated.View
                        entering={ZoomIn.duration(400).easing(Easing.out(Easing.quad))}
                        style={styles.cardContainer}
                    >
                        <GlassCard style={styles.card}>
                            <View>
                                <LinearGradient
                                    colors={['#FFD700', '#FDB931', '#F5AF19']}
                                    style={styles.successIconContainer}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                >
                                    <View style={styles.iconInnerGlow}>
                                        <FontAwesome name="sun-o" size={64} color="#FFF" />
                                    </View>
                                </LinearGradient>
                            </View>

                            <Animated.Text
                                entering={FadeInDown.delay(200).duration(400)}
                                style={styles.successModalTitle}
                            >
                                {t('welcome') || 'Good Morning'}
                            </Animated.Text>

                            <Animated.Text
                                entering={FadeInDown.delay(300).duration(400)}
                                style={styles.successModalMessage}
                            >
                                {t('wake_up_success_msg') || 'You did it! Keep up the great work.'}
                            </Animated.Text>

                            <Animated.View
                                entering={FadeInDown.delay(400).duration(400)}
                                style={{ width: '100%', marginTop: 20 }}
                            >
                                <TouchableOpacity onPress={hideSuccessModal}>
                                    <LinearGradient
                                        colors={['#FFD700', '#FDB931']}
                                        style={styles.continueButton}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                    >
                                        <Text style={styles.continueButtonText}>{t('continue') || 'Continue'}</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </Animated.View>
                        </GlassCard>
                    </Animated.View>
                </View>
            </GradientBackground>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    cardContainer: {
        width: '100%',
        maxWidth: 400,
    },
    card: {
        alignItems: 'center',
        paddingVertical: 40,
        paddingHorizontal: 30,
    },
    successIconContainer: {
        width: 140,
        height: 140,
        borderRadius: 70,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 30,
        shadowColor: '#FFD700',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 50,
        elevation: 15,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.4)',
    },
    iconInnerGlow: {
        shadowColor: '#FFF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 20,
    },
    successModalTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 10,
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 10,
    },
    successModalMessage: {
        fontSize: 18,
        color: 'rgba(255, 255, 255, 0.9)',
        textAlign: 'center',
        marginBottom: 30,
        lineHeight: 28,
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 5,
    },
    continueButton: {
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        shadowColor: '#FFD700',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
    },
    continueButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#162046', // Deep Blue Text on Gold Button
        letterSpacing: 1,
    }
});
