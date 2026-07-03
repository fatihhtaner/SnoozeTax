import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ACTIVE_COLOR = '#FFD700'; // Gold
const INACTIVE_COLOR = 'rgba(255, 255, 255, 0.55)';

const ICONS: Record<string, React.ComponentProps<typeof FontAwesome>['name']> = {
    index: 'clock-o',
    stats: 'bar-chart',
    profile: 'user',
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function TabItem({
    focused,
    label,
    iconName,
    onPress,
    onLongPress,
}: {
    focused: boolean;
    label: string;
    iconName: React.ComponentProps<typeof FontAwesome>['name'];
    onPress: () => void;
    onLongPress: () => void;
}) {
    const progress = useSharedValue(focused ? 1 : 0);
    const scale = useSharedValue(1);

    useEffect(() => {
        progress.value = withTiming(focused ? 1 : 0, { duration: 260 });
    }, [focused, progress]);

    const pillStyle = useAnimatedStyle(() => ({
        opacity: progress.value,
        transform: [{ scale: interpolate(progress.value, [0, 1], [0.8, 1]) }],
    }));

    const iconStyle = useAnimatedStyle(() => ({
        transform: [
            { scale: scale.value * interpolate(progress.value, [0, 1], [1, 1.12]) },
            { translateY: interpolate(progress.value, [0, 1], [0, -2]) },
        ],
    }));

    const labelStyle = useAnimatedStyle(() => ({
        opacity: interpolate(progress.value, [0, 1], [0.7, 1]),
    }));

    return (
        <AnimatedPressable
            accessibilityRole="button"
            accessibilityState={focused ? { selected: true } : {}}
            onPress={onPress}
            onLongPress={onLongPress}
            onPressIn={() => {
                scale.value = withSpring(0.9, { mass: 0.4, damping: 12 });
            }}
            onPressOut={() => {
                scale.value = withSpring(1, { mass: 0.4, damping: 12 });
            }}
            style={styles.tabItem}>
            <View style={styles.tabItemInner}>
                <View style={styles.iconWrap}>
                    <Animated.View style={[styles.activePill, pillStyle]}>
                        <LinearGradient
                            colors={['rgba(255, 215, 0, 0.25)', 'rgba(255, 215, 0, 0.08)']}
                            style={StyleSheet.absoluteFill}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        />
                    </Animated.View>
                    <Animated.View style={iconStyle}>
                        <FontAwesome
                            name={iconName}
                            size={22}
                            color={focused ? ACTIVE_COLOR : INACTIVE_COLOR}
                        />
                    </Animated.View>
                </View>
                <Animated.Text
                    numberOfLines={1}
                    style={[
                        styles.label,
                        { color: focused ? ACTIVE_COLOR : INACTIVE_COLOR },
                        labelStyle,
                    ]}>
                    {label}
                </Animated.Text>
            </View>
        </AnimatedPressable>
    );
}

export default function ModernTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 12) }]}>
            <View style={styles.shadowContainer}>
                <BlurView
                    intensity={Platform.OS === 'android' ? 60 : 40}
                    tint="dark"
                    style={styles.blur}>
                    <View style={styles.bar}>
                        {state.routes.map((route, index) => {
                            const { options } = descriptors[route.key];
                            const label =
                                typeof options.tabBarLabel === 'string'
                                    ? options.tabBarLabel
                                    : options.title ?? route.name;
                            const focused = state.index === index;

                            const onPress = () => {
                                const event = navigation.emit({
                                    type: 'tabPress',
                                    target: route.key,
                                    canPreventDefault: true,
                                });
                                if (!focused && !event.defaultPrevented) {
                                    navigation.navigate(route.name);
                                }
                            };

                            const onLongPress = () => {
                                navigation.emit({
                                    type: 'tabLongPress',
                                    target: route.key,
                                });
                            };

                            return (
                                <TabItem
                                    key={route.key}
                                    focused={focused}
                                    label={label}
                                    iconName={ICONS[route.name] ?? 'circle'}
                                    onPress={onPress}
                                    onLongPress={onLongPress}
                                />
                            );
                        })}
                    </View>
                </BlurView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        paddingHorizontal: 20,
        backgroundColor: 'transparent',
    },
    shadowContainer: {
        borderRadius: 28,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 18,
        elevation: 12,
    },
    blur: {
        borderRadius: 28,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 215, 0, 0.25)',
        backgroundColor: 'rgba(22, 32, 70, 0.55)',
    },
    bar: {
        flexDirection: 'row',
        height: 68,
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingHorizontal: 8,
    },
    tabItem: {
        flex: 1,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    tabItemInner: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 8,
    },
    iconWrap: {
        width: 56,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
    },
    activePill: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: 18,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 215, 0, 0.35)',
    },
    label: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
});
