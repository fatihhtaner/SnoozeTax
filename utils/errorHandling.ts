import { i18n } from '@/i18n/i18n';

export const getErrorMessage = (error: any): string => {
    const code = error?.code || 'unknown';

    switch (code) {
        // Auth Errors
        case 'auth/invalid-email':
            return i18n.t('errors.invalid_email');
        case 'auth/user-disabled':
            return i18n.t('errors.user_disabled');
        case 'auth/user-not-found':
            return i18n.t('errors.user_not_found');
        case 'auth/wrong-password':
            return i18n.t('errors.wrong_password');
        case 'auth/email-already-in-use':
            return i18n.t('errors.email_in_use');
        case 'auth/weak-password':
            return i18n.t('errors.weak_password');
        case 'auth/operation-not-allowed':
            return i18n.t('errors.operation_not_allowed');
        case 'auth/requires-recent-login':
            return i18n.t('errors.requires_recent_login');
        case 'auth/credential-already-in-use':
            return i18n.t('errors.credential_in_use');
        case 'auth/invalid-credential':
            return i18n.t('errors.invalid_credential');
        case 'auth/too-many-requests':
            return i18n.t('errors.too_many_requests');

        // Network / General
        case 'auth/network-request-failed':
            return i18n.t('errors.network_error');

        default:
            return error?.message || i18n.t('errors.unknown');
    }
};
