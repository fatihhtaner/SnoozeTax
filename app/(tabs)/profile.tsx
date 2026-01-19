import { auth } from '@/config/firebaseConfig';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { UserService } from '@/services/UserService';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import React, { useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const { userProfile, setUserProfile } = useAuth(); // Assuming setUserProfile is exposed in Context, if not we'll just reload
    const { t, setLocale, locale } = useLanguage();
    const router = useRouter();

    const [isEditing, setIsEditing] = useState(false);
    const [newDisplayName, setNewDisplayName] = useState(userProfile?.displayName || '');
    const [isLangModalVisible, setLangModalVisible] = useState(false);

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            router.replace('/(auth)/login');
        } catch (error) {
            Alert.alert(t('error'), t('failed_sign_out'));
        }
    };

    const handleSaveProfile = async () => {
        if (!userProfile) return;
        try {
            await UserService.updateUser(userProfile.uid, { displayName: newDisplayName });
            // Ideally update local state too
            setIsEditing(false);
            Alert.alert('Success', 'Profile updated!');
        } catch (error) {
            Alert.alert('Error', 'Failed to update profile');
        }
    };

    const languages = [
        { code: 'en', label: 'English', icon: '🇺🇸' },
        { code: 'tr', label: 'Türkçe', icon: '🇹🇷' },
        { code: 'de', label: 'Deutsch', icon: '🇩🇪' },
        { code: 'fr', label: 'Français', icon: '🇫🇷' },
        { code: 'es', label: 'Español', icon: '🇪🇸' },
    ];

    const currentLangLabel = languages.find(l => l.code === locale)?.label || 'English';

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* Header / Avatar */}
                <View style={styles.header}>
                    <View style={[styles.avatarContainer, { borderColor: theme.primary }]}>
                        <FontAwesome name="user" size={50} color={theme.primary} />
                    </View>
                    <Text style={[styles.name, { color: theme.text }]}>{userProfile?.displayName || 'User'}</Text>
                    <Text style={[styles.email, { color: theme.icon }]}>{userProfile?.email}</Text>

                    <TouchableOpacity
                        style={[styles.editButton, { backgroundColor: theme.card }]}
                        onPress={() => setIsEditing(true)}
                    >
                        <FontAwesome name="pencil" size={16} color={theme.text} />
                        <Text style={[styles.editButtonText, { color: theme.text }]}> Edit Profile</Text>
                    </TouchableOpacity>
                </View>

                {/* Stats Summary Row */}
                <View style={styles.statsRow}>
                    <View style={[styles.statItem, { backgroundColor: theme.card }]}>
                        <Text style={[styles.statValue, { color: theme.primary }]}>{userProfile?.stats.totalSnoozes || 0}</Text>
                        <Text style={[styles.statLabel, { color: theme.icon }]}>{t('snooze')}</Text>
                    </View>
                    <View style={[styles.statItem, { backgroundColor: theme.card }]}>
                        <Text style={[styles.statValue, { color: theme.error }]}>${userProfile?.stats.totalMoneyLost || 0}</Text>
                        <Text style={[styles.statLabel, { color: theme.icon }]}>Lost</Text>
                    </View>
                </View>

                {/* Settings Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('settings')}</Text>

                    <TouchableOpacity
                        style={[styles.settingRow, { borderBottomColor: theme.border }]}
                        onPress={() => setLangModalVisible(true)}
                    >
                        <View style={styles.settingLeft}>
                            <FontAwesome name="globe" size={20} color={theme.text} />
                            <Text style={[styles.settingText, { color: theme.text }]}>{t('language')}</Text>
                        </View>
                        <View style={styles.settingRight}>
                            <Text style={{ color: theme.icon, marginRight: 10 }}>{currentLangLabel}</Text>
                            <FontAwesome name="chevron-right" size={14} color={theme.icon} />
                        </View>
                    </TouchableOpacity>

                    {/* Placeholder for Notifications or other settings */}
                    <TouchableOpacity style={[styles.settingRow, { borderBottomColor: theme.border }]}>
                        <View style={styles.settingLeft}>
                            <FontAwesome name="bell" size={20} color={theme.text} />
                            <Text style={[styles.settingText, { color: theme.text }]}>Notifications</Text>
                        </View>
                        <View style={styles.settingRight}>
                            <FontAwesome name="chevron-right" size={14} color={theme.icon} />
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Sign Out */}
                <TouchableOpacity
                    style={[styles.signOutButton, { backgroundColor: theme.error + '20' }]}
                    onPress={handleSignOut}>
                    <Text style={[styles.signOutText, { color: theme.error }]}>{t('sign_out')}</Text>
                </TouchableOpacity>

            </ScrollView>

            {/* Language Modal */}
            <Modal visible={isLangModalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
                        <Text style={[styles.modalTitle, { color: theme.text }]}>Select Language</Text>
                        {languages.map((lang) => (
                            <TouchableOpacity
                                key={lang.code}
                                style={[styles.langOption, { backgroundColor: locale === lang.code ? theme.primary + '20' : 'transparent' }]}
                                onPress={() => {
                                    setLocale(lang.code as any);
                                    setLangModalVisible(false);
                                }}
                            >
                                <Text style={{ fontSize: 24 }}>{lang.icon}</Text>
                                <Text style={[styles.langText, { color: theme.text, fontWeight: locale === lang.code ? 'bold' : 'normal' }]}>{lang.label}</Text>
                                {locale === lang.code && <FontAwesome name="check" size={16} color={theme.primary} />}
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity style={styles.closeButton} onPress={() => setLangModalVisible(false)}>
                            <Text style={{ color: theme.icon }}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Edit Profile Modal */}
            <Modal visible={isEditing} animationType="fade" transparent>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
                        <Text style={[styles.modalTitle, { color: theme.text }]}>Edit Profile</Text>

                        <Text style={[styles.label, { color: theme.icon }]}>Display Name</Text>
                        <TextInput
                            style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                            value={newDisplayName}
                            onChangeText={setNewDisplayName}
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={[styles.modalButton, { backgroundColor: theme.border }]} onPress={() => setIsEditing(false)}>
                                <Text style={{ color: theme.text }}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalButton, { backgroundColor: theme.primary }]} onPress={handleSaveProfile}>
                                <Text style={{ color: '#FFF' }}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { padding: 20 },
    header: { alignItems: 'center', marginBottom: 30 },
    avatarContainer: {
        width: 100, height: 100, borderRadius: 50, borderWidth: 3,
        justifyContent: 'center', alignItems: 'center', marginBottom: 15,
        backgroundColor: 'rgba(0,0,0,0.05)'
    },
    name: { fontSize: 24, fontWeight: 'bold', marginBottom: 5 },
    email: { fontSize: 16, marginBottom: 15 },
    editButton: {
        flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 16,
        borderRadius: 20,
    },
    editButtonText: { fontSize: 14, fontWeight: '600' },
    statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
    statItem: { flex: 1, alignItems: 'center', padding: 15, borderRadius: 12, marginHorizontal: 5 },
    statValue: { fontSize: 20, fontWeight: 'bold' },
    statLabel: { fontSize: 14, marginTop: 4 },
    section: { marginBottom: 30 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
    settingRow: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingVertical: 15, borderBottomWidth: StyleSheet.hairlineWidth
    },
    settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 15 },
    settingText: { fontSize: 16 },
    settingRight: { flexDirection: 'row', alignItems: 'center' },
    signOutButton: {
        padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 10
    },
    signOutText: { fontSize: 16, fontWeight: 'bold' },
    modalOverlay: {
        flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end'
    },
    modalContent: {
        borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 25, maxHeight: '60%'
    },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    langOption: {
        flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 10, marginBottom: 10
    },
    langText: { fontSize: 16, marginLeft: 15, flex: 1 },
    closeButton: { alignItems: 'center', marginTop: 15, padding: 10 },
    label: { marginBottom: 8, fontWeight: '600' },
    input: {
        borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 20
    },
    modalButtons: { flexDirection: 'row', gap: 15 },
    modalButton: {
        flex: 1, padding: 12, borderRadius: 8, alignItems: 'center'
    }
});
