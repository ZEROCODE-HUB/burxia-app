export const lightColors = {
    // Brand Colors - Magnate
    primary: '#0A2540',
    primaryForeground: '#FFFFFF',
    accent: '#2F80ED',
    accentForeground: '#FFFFFF',
    success: '#27AE60',
    successForeground: '#FFFFFF',
    destructive: '#E74C3C',
    destructiveForeground: '#FFFFFF',
    warning: '#FBBF24',

    // Backgrounds
    background: '#F8FAFC',
    foreground: '#0A2540',
    card: '#FFFFFF',
    cardForeground: '#0A2540',

    // UI Elements
    muted: '#F1F5F9',
    mutedForeground: '#64748B',
    border: '#E2E8F0',
    input: '#E2E8F0',

    // Alpha versions
    accentAlpha: {
        5: 'rgba(47, 128, 237, 0.05)',
        10: 'rgba(47, 128, 237, 0.1)',
        20: 'rgba(47, 128, 237, 0.2)',
        40: 'rgba(47, 128, 237, 0.4)',
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
        10: 'rgba(100, 116, 139, 0.1)',
        20: 'rgba(100, 116, 139, 0.2)',
        30: 'rgba(100, 116, 139, 0.3)',
        40: 'rgba(100, 116, 139, 0.4)',
    },

    // Gradients
    gradientHero: ['#0A2540', '#1A3A5C'],
    gradientAccent: ['#2F80ED', '#1E6FDB'],
    gradientCard: ['#FFFFFF', '#F8FAFC'],
    featureGradient1: ['rgba(47, 128, 237, 0.8)', '#2F80ED'],
    featureGradient2: ['rgba(47, 128, 237, 0.7)', 'rgba(47, 128, 237, 0.9)'],
    featureGradient3: ['rgba(47, 128, 237, 0.6)', 'rgba(47, 128, 237, 0.8)'],
};

export const darkColors = {
    // Brand Colors - Magnate Dark
    primary: '#1E293B',
    primaryForeground: '#F8FAFC',
    accent: '#3B82F6',
    accentForeground: '#FFFFFF',
    success: '#22C55E',
    successForeground: '#FFFFFF',
    destructive: '#EF4444',
    destructiveForeground: '#FFFFFF',
    warning: '#F59E0B',

    // Backgrounds
    background: '#0F172A',
    foreground: '#F8FAFC',
    card: '#1E293B',
    cardForeground: '#F8FAFC',

    // UI Elements
    muted: '#334155',
    mutedForeground: '#94A3B8',
    border: '#334155',
    input: '#334155',

    // Alpha versions
    accentAlpha: {
        5: 'rgba(59, 130, 246, 0.05)',
        10: 'rgba(59, 130, 246, 0.1)',
        20: 'rgba(59, 130, 246, 0.2)',
        40: 'rgba(59, 130, 246, 0.4)',
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
        10: 'rgba(148, 163, 184, 0.1)',
        20: 'rgba(148, 163, 184, 0.2)',
        30: 'rgba(148, 163, 184, 0.3)',
        40: 'rgba(148, 163, 184, 0.4)',
    },

    // Gradients
    gradientHero: ['#1E293B', '#0F172A'],
    gradientAccent: ['#3B82F6', '#2563EB'],
    gradientCard: ['#1E293B', '#0F172A'],
    featureGradient1: ['rgba(59, 130, 246, 0.8)', '#3B82F6'],
    featureGradient2: ['rgba(59, 130, 246, 0.7)', 'rgba(59, 130, 246, 0.9)'],
    featureGradient3: ['rgba(59, 130, 246, 0.6)', 'rgba(59, 130, 246, 0.8)'],
};

export const colors = darkColors;
export type Colors = typeof darkColors;
