import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { Animated, Dimensions, StyleSheet, Text, View } from 'react-native';

type ToastType = 'success' | 'error' | 'info';

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within a ToastProvider');
    return context;
};

const { width } = Dimensions.get('window');

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
    const [visible, setVisible] = useState(false);
    const [message, setMessage] = useState('');
    const [type, setType] = useState<ToastType>('info');

    // Animation value
    const translateY = useRef(new Animated.Value(100)).current;

    const showToast = useCallback((msg: string, t: ToastType = 'info') => {
        setMessage(msg);
        setType(t);
        setVisible(true);

        // Slide up
        Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            friction: 8,
        }).start();

        // Auto hide
        setTimeout(() => {
            hideToast();
        }, 3000);
    }, []);

    const hideToast = () => {
        Animated.timing(translateY, {
            toValue: 100,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            setVisible(false);
        });
    };

    const getIcon = () => {
        switch (type) {
            case 'success': return 'check-circle';
            case 'error': return 'exclamation-circle';
            default: return 'info-circle';
        }
    };

    const getColors = (): [string, string, ...string[]] => {
        switch (type) {
            case 'success': return ['rgba(46, 196, 182, 0.9)', 'rgba(203, 243, 240, 0.8)']; // Teal/Mint
            case 'error': return ['rgba(255, 107, 107, 0.9)', 'rgba(255, 82, 82, 0.8)']; // Red
            default: return ['rgba(32, 58, 67, 0.9)', 'rgba(44, 83, 100, 0.8)']; // Blue/Grey
        }
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {visible && (
                <Animated.View style={[styles.container, { transform: [{ translateY }] }]}>
                    <LinearGradient
                        colors={getColors()}
                        style={styles.gradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <View style={styles.content}>
                            <FontAwesome name={getIcon()} size={20} color="#FFF" style={{ marginRight: 10 }} />
                            <Text style={styles.text}>{message}</Text>
                        </View>
                    </LinearGradient>
                </Animated.View>
            )}
        </ToastContext.Provider>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 50, // Above tab bar if present
        width: width - 40,
        left: 20,
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 10,
        zIndex: 9999,
    },
    gradient: {
        paddingVertical: 15,
        paddingHorizontal: 20,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    text: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
        flex: 1, // Wrap text if long
    }
});
