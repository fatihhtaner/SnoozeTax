/**
 * Snooze Tax Theme
 * Design: Glassmorphism / Dark Mode with Teal Accents
 */

const tintColorLight = '#2EC4B6';
const tintColorDark = '#CBF3F0';

export const Colors = {
  light: {
    text: '#0F2027',
    background: '#FFFFFF',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    primary: '#2EC4B6', // Teal
    secondary: '#CBF3F0', // Light Teal
    accent: '#FF6B6B', // Red Accent/Error
    deepBlue: '#0F2027',
    error: '#FF6B6B',
    border: '#CBF3F0',
    backgroundGradient: ['#FFFFFF', '#CBF3F0'],
  },
  dark: {
    text: '#FFFFFF',
    background: '#0F2027', // Deep Blue
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    primary: '#CBF3F0', // Light Teal for contrast in dark mode
    secondary: '#2EC4B6', // Teal
    accent: '#FF6B6B',
    deepBlue: '#0F2027',
    error: '#FF6B6B',
    border: 'rgba(255, 255, 255, 0.2)',
    backgroundGradient: ['#0F2027', '#203A43', '#2C5364'],
  },
};
