import ConfirmationModal from '@/components/ConfirmationModal';
import GlassCard from '@/components/GlassCard';
import GlassModal from '@/components/GlassModal';
import GradientBackground from '@/components/GradientBackground';
import { auth } from '@/config/firebaseConfig';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { UserService } from '@/services/UserService';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import React, { useState } from 'react';
import { Alert, Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
    const { userProfile } = useAuth();
    const { t, setLocale, locale } = useLanguage();
    const router = useRouter();

    const [isLangModalVisible, setLangModalVisible] = useState(false);
    const [isPrivacyModalVisible, setPrivacyModalVisible] = useState(false);

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            router.replace('/(auth)/login');
        } catch (error) {
            Alert.alert(t('error'), t('failed_sign_out'));
        }
    };

    const [isSecurityModalVisible, setSecurityModalVisible] = useState(false);
    const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const handleDeleteAccount = () => {
        setDeleteModalVisible(true);
    };

    const confirmDelete = async () => {
        if (!auth.currentUser) return;
        setDeleteLoading(true);
        try {
            // Delete from Firestore
            await UserService.deleteUser(auth.currentUser.uid);
            // Delete from Auth
            await auth.currentUser.delete();
            router.replace('/(auth)/login');
        } catch (error: any) {
            console.error(error);
            setDeleteModalVisible(false);
            if (error.code === 'auth/requires-recent-login') {
                setSecurityModalVisible(true);
            } else {
                Alert.alert(t('error'), 'Failed to delete account. Please try again.');
            }
        } finally {
            setDeleteLoading(false);
        }
    };

    const languages = [
        { code: 'en', label: 'English', icon: '🇺🇸' },
        { code: 'tr', label: 'Türkçe', icon: '🇹🇷' },
        { code: 'de', label: 'Deutsch', icon: '🇩🇪' },
        { code: 'fr', label: 'Français', icon: '🇫🇷' },
        { code: 'es', label: 'Español', icon: '🇪🇸' },
        { code: 'it', label: 'Italiano', icon: '🇮🇹' },
        { code: 'pt', label: 'Português', icon: '🇵🇹' },
        { code: 'ru', label: 'Русский', icon: '🇷🇺' },
        { code: 'ja', label: '日本語', icon: '🇯🇵' },
        { code: 'zh', label: '中文', icon: '🇨🇳' },
    ];

    const currentLangLabel = languages.find(l => l.code === locale)?.label || 'English';

    return (
        <GradientBackground>
            <SafeAreaView style={styles.container}>
                <ScrollView contentContainerStyle={styles.scrollContent}>

                    {/* Header / Avatar */}
                    <View style={styles.header}>
                        <View style={styles.avatarContainer}>
                            {userProfile?.photoURL ? (
                                <Image source={{ uri: userProfile.photoURL }} style={styles.avatarImage} />
                            ) : (
                                <FontAwesome name="user" size={50} color="#CBF3F0" />
                            )}
                        </View>
                        <Text style={styles.name}>{userProfile?.displayName || 'User'}</Text>
                        <Text style={styles.email}>{userProfile?.email}</Text>
                    </View>

                    {/* Stats Summary Row */}
                    <View style={styles.statsRow}>
                        <GlassCard style={styles.statItem}>
                            <Text style={styles.statValue}>{userProfile?.stats?.totalSnoozes || 0}</Text>
                            <Text style={styles.statLabel}>{t('snoozes')}</Text>
                        </GlassCard>
                        <GlassCard style={styles.statItem}>
                            <Text style={[styles.statValue, { color: '#FF6B6B' }]}>${Number(userProfile?.stats?.totalMoneyLost || 0).toFixed(2)}</Text>
                            <Text style={styles.statLabel}>{t('lost')}</Text>
                        </GlassCard>
                    </View>

                    {/* Settings Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>{t('settings')}</Text>

                        <GlassCard style={styles.settingsCard}>
                            <TouchableOpacity
                                style={[styles.settingRow, { borderBottomColor: 'rgba(255,255,255,0.1)' }]}
                                onPress={() => setLangModalVisible(true)}
                            >
                                <View style={styles.settingLeft}>
                                    <FontAwesome name="globe" size={20} color="#CBF3F0" />
                                    <Text style={styles.settingText}>{t('language')}</Text>
                                </View>
                                <View style={styles.settingRight}>
                                    <Text style={{ color: 'rgba(255,255,255,0.6)', marginRight: 10 }}>{currentLangLabel}</Text>
                                    <FontAwesome name="chevron-right" size={14} color="rgba(255,255,255,0.4)" />
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.settingRow, { borderBottomColor: 'rgba(255,255,255,0.1)' }]}
                                onPress={() => Linking.openURL('https://ibrahimfatihtaner.com/#contact')}
                            >
                                <View style={styles.settingLeft}>
                                    <FontAwesome name="commenting-o" size={20} color="#CBF3F0" />
                                    <Text style={styles.settingText}>{t('feedback')}</Text>
                                </View>
                                <View style={styles.settingRight}>
                                    <FontAwesome name="chevron-right" size={14} color="rgba(255,255,255,0.4)" />
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.settingRow, { borderBottomColor: 'rgba(255,255,255,0.1)' }]}
                                onPress={() => {
                                    // TODO: Replace with your actual App ID from App Store Connect
                                    const APP_ID = '6443656157'; // This is a placeholder ID (e.g., from another app or just '1234567890')
                                    const url = `https://apps.apple.com/app/id${APP_ID}?action=write-review`;
                                    Linking.openURL(url).catch(err => {
                                        console.error('An error occurred', err);
                                        Alert.alert(t('error'), 'Could not open App Store');
                                    });
                                }}
                            >
                                <View style={styles.settingLeft}>
                                    <FontAwesome name="star-o" size={20} color="#CBF3F0" />
                                    <Text style={styles.settingText}>{t('rate_app')}</Text>
                                </View>
                                <View style={styles.settingRight}>
                                    <FontAwesome name="chevron-right" size={14} color="rgba(255,255,255,0.4)" />
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.settingRow, { borderBottomWidth: 0 }]}
                                onPress={() => setPrivacyModalVisible(true)}
                            >
                                <View style={styles.settingLeft}>
                                    <FontAwesome name="lock" size={20} color="#CBF3F0" />
                                    <Text style={styles.settingText}>{t('privacy_policy')}</Text>
                                </View>
                                <View style={styles.settingRight}>
                                    <FontAwesome name="chevron-right" size={14} color="rgba(255,255,255,0.4)" />
                                </View>
                            </TouchableOpacity>
                        </GlassCard>
                    </View>

                    {/* Sign Out */}
                    <TouchableOpacity
                        style={styles.signOutButton}
                        onPress={handleSignOut}>
                        <FontAwesome name="sign-out" size={16} color="#FF6B6B" style={{ marginRight: 8 }} />
                        <Text style={styles.signOutText}>{t('sign_out')}</Text>
                    </TouchableOpacity>

                    {/* Delete Account */}
                    <TouchableOpacity
                        style={styles.deleteAccountButton}
                        onPress={handleDeleteAccount}>
                        <FontAwesome name="trash-o" size={16} color="rgba(255, 107, 107, 0.7)" style={{ marginRight: 8 }} />
                        <Text style={styles.deleteAccountText}>{t('delete_account')}</Text>
                    </TouchableOpacity>

                    <Text style={styles.versionText}>{t('version')} 1.0.0</Text>

                </ScrollView>
            </SafeAreaView>

            {/* Language Modal */}
            <GlassModal
                visible={isLangModalVisible}
                onClose={() => setLangModalVisible(false)}
                title={t('language')}
            >
                <ScrollView showsVerticalScrollIndicator={false}>
                    {languages.map((lang) => (
                        <TouchableOpacity
                            key={lang.code}
                            style={[
                                styles.langOption,
                                {
                                    backgroundColor: locale === lang.code ? 'rgba(203, 243, 240, 0.2)' : 'transparent',
                                    borderColor: locale === lang.code ? '#CBF3F0' : 'transparent'
                                }
                            ]}
                            onPress={() => {
                                setLocale(lang.code as any);
                                setLangModalVisible(false);
                            }}
                        >
                            <Text style={{ fontSize: 24 }}>{lang.icon}</Text>
                            <Text style={[styles.langText, { fontWeight: locale === lang.code ? 'bold' : 'normal' }]}>{lang.label}</Text>
                            {locale === lang.code && <FontAwesome name="check" size={16} color="#CBF3F0" />}
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </GlassModal>

            {/* Privacy Policy Modal */}
            <GlassModal
                visible={isPrivacyModalVisible}
                onClose={() => setPrivacyModalVisible(false)}
                title={t('privacy_policy')}
            >
                <ScrollView style={{ flex: 1 }}>
                    <Text style={{ color: '#E0E0E0', fontSize: 14, lineHeight: 22 }}>
                        {t('privacy_policy_text')}
                    </Text>
                </ScrollView>
            </GlassModal>

            {/* Delete Account Modal - Replaced with ConfirmationModal */}
            <ConfirmationModal
                visible={isDeleteModalVisible}
                onClose={() => setDeleteModalVisible(false)}
                onConfirm={confirmDelete}
                title={t('delete_account')}
                message={t('delete_account_confirm')}
                confirmText={deleteLoading ? '...' : t('delete')}
                cancelText={t('cancel')}
                destructive
                loading={deleteLoading}
            />

            {/* Security Check Modal - Uses ConfirmationModal with custom texts */}
            <ConfirmationModal
                visible={isSecurityModalVisible}
                onClose={() => setSecurityModalVisible(false)}
                onConfirm={() => {
                    setSecurityModalVisible(false);
                    handleSignOut();
                }}
                title={t('security_check') || 'Security Check'}
                message={t('requires_recent_login') || 'For your security, please sign in again to delete your account.'}
                confirmText={t('sign_out')}
                cancelText={t('cancel')}
            />
        </GradientBackground >
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { padding: 20 },
    header: { alignItems: 'center', marginBottom: 30 },
    avatarContainer: {
        width: 100, height: 100, borderRadius: 50, borderWidth: 2,
        justifyContent: 'center', alignItems: 'center', marginBottom: 15,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderColor: '#CBF3F0',
        shadowColor: '#CBF3F0',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 5,
        overflow: 'hidden', // Ensure image doesn't bleed fast rounded corners
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    name: { fontSize: 24, fontWeight: 'bold', marginBottom: 5, color: '#FFFFFF' },
    email: { fontSize: 16, marginBottom: 15, color: 'rgba(255, 255, 255, 0.7)' },
    statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
    statItem: {
        flex: 1,
        alignItems: 'center',
        padding: 15,
        marginHorizontal: 5,
        justifyContent: 'center',
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#CBF3F0',
    },
    statLabel: {
        fontSize: 14,
        marginTop: 4,
        color: 'rgba(255, 255, 255, 0.7)',
    },
    section: { marginBottom: 30 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#FFFFFF', marginLeft: 10 },
    settingsCard: {
        borderRadius: 16,
        padding: 0,
        overflow: 'hidden',
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderBottomWidth: StyleSheet.hairlineWidth
    },
    settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 15 },
    settingText: { fontSize: 16, color: '#FFFFFF' },
    settingRight: { flexDirection: 'row', alignItems: 'center' },
    signOutButton: {
        borderRadius: 12,
        overflow: 'hidden',
        marginTop: 10,
        backgroundColor: 'rgba(255, 82, 82, 0.2)',
        borderWidth: 1,
        borderColor: 'rgba(255, 82, 82, 0.3)',
        padding: 15,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    signOutText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FF6B6B',
    },
    deleteAccountButton: {
        marginTop: 20,
        alignItems: 'center',
        padding: 15,
        marginBottom: 20,
        flexDirection: 'row',
        justifyContent: 'center',
    },
    deleteAccountText: {
        fontSize: 14,
        color: 'rgba(255, 107, 107, 0.7)',
        textDecorationLine: 'underline',
    },
    langOption: {
        flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: 'transparent'
    },
    langText: { fontSize: 16, marginLeft: 15, flex: 1, color: '#FFFFFF' },
    versionText: {
        textAlign: 'center',
        color: 'rgba(255,255,255,0.3)',
        marginBottom: 20,
        fontSize: 12,
    }
});
