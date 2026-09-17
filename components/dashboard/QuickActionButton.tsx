import React, { useMemo } from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, borderRadius, typography } from '../../theme';
import { useTheme } from '../../context/ThemeContext';

interface ActionButtonProps {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    onPress: () => void;
    isPrimary?: boolean;
}

export const QuickActionButton: React.FC<ActionButtonProps> = ({
    icon,
    label,
    onPress,
    isPrimary = false,
}) => {
    const { colors, isDark } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View
                style={[
                    styles.iconContainer,
                    isPrimary ? styles.primaryIconContainer : styles.secondaryIconContainer
                ]}
            >
                <Ionicons
                    name={icon}
                    size={24}
                    color={isPrimary ? colors.accentForeground : colors.accent}
                />
            </View>
            <Text
                style={[
                    styles.label,
                    isPrimary ? styles.primaryLabel : styles.secondaryLabel
                ]}
            >
                {label}
            </Text>
        </TouchableOpacity>
    );
};

const createStyles = (colors: any) => StyleSheet.create({
    container: {
        alignItems: 'center',
        gap: spacing.xs,
        width: 72,
    },
    iconContainer: {
        width: 60,
        height: 60,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    primaryIconContainer: {
        backgroundColor: colors.accent,
        shadowColor: colors.accent,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    secondaryIconContainer: {
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    label: {
        fontSize: 11,
        fontWeight: '500',
        textAlign: 'center',
    },
    primaryLabel: {
        color: colors.accent,
        fontWeight: '600',
    },
    secondaryLabel: {
        color: colors.mutedForeground,
    },
});
