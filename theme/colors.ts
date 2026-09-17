export const lightColors = {
    // Brand Colors - Burxia (violeta: #2D2154 oscuro / #5A4F9D medio / #AA91C4 claro)
    primary: '#2D2154',
    primaryForeground: '#FFFFFF',
    accent: '#5A4F9D',
    accentForeground: '#FFFFFF',
    success: '#27AE60',
    successForeground: '#FFFFFF',
    destructive: '#E74C3C',
    destructiveForeground: '#FFFFFF',
    warning: '#FBBF24',

    // Backgrounds
    background: '#F8F7FC',
    foreground: '#2D2154',
    card: '#FFFFFF',
    cardForeground: '#2D2154',

    // UI Elements
    muted: '#F2F0F9',
    mutedForeground: '#6E6890',
    border: '#E6E2F0',
    input: '#E6E2F0',

    // Alpha versions
    accentAlpha: {
        5: 'rgba(90, 79, 157, 0.05)',
        10: 'rgba(90, 79, 157, 0.1)',
        20: 'rgba(90, 79, 157, 0.2)',
        40: 'rgba(90, 79, 157, 0.4)',
    },
    successAlpha: {
        5: 'rgba(39, 174, 96, 0.05)',
        10: 'rgba(39, 174, 96, 0.1)',
        20: 'rgba(39, 174, 96, 0.2)',
        40: 'rgba(39, 174, 96, 0.4)',
    },
    warningAlpha: {
        5: 'rgba(251, 191, 36, 0.05)',
        10: 'rgba(251, 191, 36, 0.1)',
        20: 'rgba(251, 191, 36, 0.2)',
        40: 'rgba(251, 191, 36, 0.4)',
    },
    destructiveAlpha: {
        5: 'rgba(231, 76, 60, 0.05)',
        10: 'rgba(231, 76, 60, 0.1)',
        20: 'rgba(231, 76, 60, 0.2)',
    },
    mutedAlpha: {
        10: 'rgba(110, 104, 144, 0.1)',
        20: 'rgba(110, 104, 144, 0.2)',
        30: 'rgba(110, 104, 144, 0.3)',
        40: 'rgba(110, 104, 144, 0.4)',
    },

    // Gradients
    gradientHero: ['#2D2154', '#5A4F9D'],
    gradientAccent: ['#5A4F9D', '#3E3576'],
    gradientCard: ['#FFFFFF', '#F8F7FC'],
    featureGradient1: ['rgba(90, 79, 157, 0.8)', '#5A4F9D'],
    featureGradient2: ['rgba(90, 79, 157, 0.7)', 'rgba(90, 79, 157, 0.9)'],
    featureGradient3: ['rgba(90, 79, 157, 0.6)', 'rgba(90, 79, 157, 0.8)'],
};

export const darkColors = {
    // Brand Colors - Burxia Dark (violeta)
    primary: '#2D2154',
    primaryForeground: '#F5F3FB',
    accent: '#8B7BD6',
    accentForeground: '#FFFFFF',
    success: '#22C55E',
    successForeground: '#FFFFFF',
    destructive: '#EF4444',
    destructiveForeground: '#FFFFFF',
    warning: '#F59E0B',

    // Backgrounds
    background: '#17122E',
    foreground: '#F5F3FB',
    card: '#241C46',
    cardForeground: '#F5F3FB',

    // UI Elements
    muted: '#3A3168',
    mutedForeground: '#A79CC6',
    border: '#3A3168',
    input: '#3A3168',

    // Alpha versions
    accentAlpha: {
        5: 'rgba(139, 123, 214, 0.05)',
        10: 'rgba(139, 123, 214, 0.1)',
        20: 'rgba(139, 123, 214, 0.2)',
        40: 'rgba(139, 123, 214, 0.4)',
    },
    successAlpha: {
        5: 'rgba(34, 197, 94, 0.05)',
        10: 'rgba(34, 197, 94, 0.1)',
        20: 'rgba(34, 197, 94, 0.2)',
        40: 'rgba(34, 197, 94, 0.4)',
    },
    warningAlpha: {
        5: 'rgba(245, 158, 11, 0.05)',
        10: 'rgba(245, 158, 11, 0.1)',
        20: 'rgba(245, 158, 11, 0.2)',
        40: 'rgba(245, 158, 11, 0.4)',
    },
    destructiveAlpha: {
        5: 'rgba(239, 68, 68, 0.05)',
        10: 'rgba(239, 68, 68, 0.1)',
        20: 'rgba(239, 68, 68, 0.2)',
    },
    mutedAlpha: {
        10: 'rgba(167, 156, 198, 0.1)',
        20: 'rgba(167, 156, 198, 0.2)',
        30: 'rgba(167, 156, 198, 0.3)',
        40: 'rgba(167, 156, 198, 0.4)',
    },

    // Gradients
    gradientHero: ['#2D2154', '#17122E'],
    gradientAccent: ['#8B7BD6', '#5A4F9D'],
    gradientCard: ['#241C46', '#17122E'],
    featureGradient1: ['rgba(139, 123, 214, 0.8)', '#8B7BD6'],
    featureGradient2: ['rgba(139, 123, 214, 0.7)', 'rgba(139, 123, 214, 0.9)'],
    featureGradient3: ['rgba(139, 123, 214, 0.6)', 'rgba(139, 123, 214, 0.8)'],
};

export const colors = darkColors;
export type Colors = typeof darkColors;
