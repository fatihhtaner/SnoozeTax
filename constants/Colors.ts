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
    background: '#162046', // Deep Blue
    tint: '#FFD700', // Gold/Yellow (Moon Color)
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: '#FFD700',
    primary: '#FFD700', // Gold/Yellow
    secondary: '#162046', // Deep Blue
    accent: '#FFD700',
    deepBlue: '#162046',
    error: '#FF6B6B',
    border: 'rgba(255, 215, 0, 0.3)', // Gold border
    backgroundGradient: ['#162046', '#203A43', '#2C5364'],
  },
};
