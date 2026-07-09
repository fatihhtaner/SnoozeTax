// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Firebase JS SDK (v10+) ships a dedicated React Native build behind the
// "react-native" package.json export condition, which includes
// `getReactNativePersistence`. Metro (with package exports enabled, the Expo
// SDK 54 default) does NOT activate the "react-native" condition on native by
// default, so Firebase resolves its "browser" build instead and auth state does
// not persist between sessions.
//
// We keep package exports enabled (needed by ESM-only packages like
// make-plural) and simply add the "react-native" condition for iOS/Android so
// Firebase resolves the correct build.
const existingConditions = config.resolver.unstable_conditionsByPlatform ?? {};
config.resolver.unstable_conditionsByPlatform = {
    ...existingConditions,
    ios: [...(existingConditions.ios ?? []), 'react-native'],
    android: [...(existingConditions.android ?? []), 'react-native'],
};

module.exports = config;
