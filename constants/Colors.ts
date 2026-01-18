/**
 * Morning Clarity Theme
 * Design: Sunrise Gradients (Warm Orange/Gold) with Deep Blue backgrounds/accents.
 */

const tintColorLight = '#FF9F1C'; // Golden Orange
const tintColorDark = '#FF9F1C';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#FFF8F0', // Soft warm white/cream
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    primary: '#FF9F1C', // Sunrise Orange
    secondary: '#FFBF69', // Soft Sun
    accent: '#CBF3F0', // Light Blue/Teal
    deepBlue: '#0F2027', // Dark contrast
    error: '#E63946', // Alert Red
    // Gradient stops (for use with expo-linear-gradient)
    sunriseGradient: ['#FF9F1C', '#FFBF69'],
    backgroundGradient: ['#FFF8F0', '#FFF8F0'], // For light mode, maybe plain or subtle
  },
  dark: {
    text: '#ECEDEE',
    background: '#0F2027', // Deep Blue
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    primary: '#FF9F1C',
    secondary: '#FFBF69',
    accent: '#2C5364',
    deepBlue: '#0F2027',
    error: '#E63946',
    sunriseGradient: ['#FF9F1C', '#FFBF69'],
    backgroundGradient: ['#0F2027', '#203A43', '#2C5364'], // Deep Blue Gradient
  },
};
