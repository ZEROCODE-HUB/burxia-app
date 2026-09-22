import React, { useMemo } from 'react';
import { View, TextInput, StyleSheet, TextInputProps, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, borderRadius, typography } from '../../theme';
import { useTheme } from '../../context/ThemeContext';

interface SearchBarProps extends TextInputProps { }

export const SearchBar: React.FC<SearchBarProps> = (props) => {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    return (
        <View style={styles.container}>
            <Ionicons name="search" size={20} color={colors.mutedForeground} style={styles.icon} />
            <TextInput
                style={styles.input}
                placeholderTextColor={colors.mutedForeground}
                placeholder="Buscar movimientos..."
                {...props}
            />
        </View>
    );
};

const createStyles = (colors: any) => StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.card,
        borderRadius: borderRadius.full,
        paddingHorizontal: spacing.md,
        height: 48,
        borderWidth: 1,
        borderColor: colors.border,
    },
    icon: {
        marginRight: spacing.sm,
    },
    input: {
        flex: 1,
        height: '100%',
        color: colors.foreground,
        fontSize: typography.sizes.sm,
        // En web, el borde de foco por defecto del navegador se ve mal sobre la tarjeta.
        ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : null),
    },
});
