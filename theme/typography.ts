export const typography = {
    // Font Families - Using system fonts for now
    fontFamily: {
        regular: 'System',
        medium: 'System',
        semibold: 'System',
        bold: 'System',
        extrabold: 'System',
    },

    // Font Sizes
    sizes: {
        xs: 10,
        sm: 12,
        base: 14,
        lg: 16,
        xl: 20,
        '2xl': 24,
        '3xl': 30,
        '4xl': 36,
    },

    // Line Heights
    lineHeights: {
        tight: 1.2,
        normal: 1.5,
        relaxed: 1.75,
    },

    // Letter Spacing
    letterSpacing: {
        tight: -0.015,
        normal: 0,
        wide: 0.025,
    },
};

export type Typography = typeof typography;
