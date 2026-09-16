import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { spacing } from '../../theme';
import { useTheme } from '../../context/ThemeContext';

interface ProgressIndicatorProps {
    currentStep: number;
    totalSteps: number;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ currentStep, totalSteps }) => {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);
    return (
        <View style={styles.container}>
            <View style={styles.barBackground}>
                <View
                    style={[
                        styles.barForeground,
                        { width: `${(currentStep / totalSteps) * 100}%` }
                    ]}
                />
            </View>
        </View>
    );
};

const createStyles = (colors: any) => StyleSheet.create({
    container: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
    },
    barBackground: {
        height: 4,
        backgroundColor: colors.border,
        borderRadius: 2,
        width: '100%',
        overflow: 'hidden',
    },
    barForeground: {
        height: '100%',
        backgroundColor: colors.accent,
        borderRadius: 2,
    },
});
