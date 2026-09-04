import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LogoIcon } from './LogoIcon';
import { typography, spacing } from '../theme';
import { useTheme } from '../context/ThemeContext';

interface LogoProps {
    showText?: boolean;
    height?: number;
}

export const Logo: React.FC<LogoProps> = ({ showText = true, height = 32 }) => {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    return (
        <View style={styles.container}>
            <View style={{ height, width: height }}>
                <LogoIcon size={height} />
            </View>

            {showText && (
                <Text style={styles.text}>Proxpera</Text>
            )}
        </View>
    );
};

const createStyles = (colors: any) => StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    text: {
        fontSize: typography.sizes.xl,
        fontWeight: '600',
        color: colors.foreground,
        letterSpacing: -0.5,
    },
});
