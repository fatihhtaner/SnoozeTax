import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface CustomHeaderProps {
    title?: string;
    showBack?: boolean;
}

export default function CustomHeader({ title, showBack = true }: CustomHeaderProps) {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    return (
        <SafeAreaView edges={['top']} style={{ backgroundColor: theme.background }}>
            <View style={[styles.container, { backgroundColor: theme.background }]}>
                {showBack && (
                    <TouchableOpacity
                        style={[styles.backButton, { backgroundColor: theme.background === '#0F2027' ? '#1A2E35' : '#F0F0F0' }]}
                        onPress={() => router.back()}
                    >
                        <FontAwesome name="arrow-left" size={20} color={theme.text} />
                    </TouchableOpacity>
                )}

                {title && (
                    <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
                )}

                {/* Placeholder for right side balance if needed later */}
                <View style={{ width: 40 }} />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        height: 50,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
});
