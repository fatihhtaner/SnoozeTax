// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Firebase JS SDK (v10+) ships a React Native build behind the "react-native"
// package.json export condition. With Expo SDK 54, Metro enables package
// exports by default and resolves Firebase's "browser" build instead, which is
// missing `getReactNativePersistence`. That breaks auth persistence (users get
// logged out on reload). Disabling package exports makes Metro fall back to the
// main fields, where the "react-native" entry wins.
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
