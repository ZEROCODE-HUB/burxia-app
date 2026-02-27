import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { spacing, typography, borderRadius } from '../../theme';
import { useTheme } from '../../context/ThemeContext';

interface Field {
    label: string;
    value: string;
}

interface InfoCardProps {
    title: string;
    fields: Field[];
}

export const InfoCard: React.FC<InfoCardProps> = ({ title, fields }) => {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{title}</Text>
            <View style={styles.card}>
                {fields.map((field, index) => (
                    <View key={field.label} style={[
                        styles.row,
                        index < fields.length - 1 && styles.borderBottom
                    ]}>
                        <Text style={styles.label}>{field.label}</Text>
                        <Text style={styles.value}>{field.value}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
};

const createStyles = (colors: any) => StyleSheet.create({
    container: {
        marginBottom: spacing.lg,
    },
    title: {
        fontSize: typography.sizes.lg,
        fontWeight: '700',
        color: colors.foreground,
        marginBottom: spacing.sm,
        marginLeft: spacing.xs,
    },
    card: {
        backgroundColor: colors.card,
        borderRadius: borderRadius.xl,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: 'hidden',
    },
    row: {
        padding: spacing.md,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    borderBottom: {
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    label: {
        fontSize: typography.sizes.sm,
        color: colors.mutedForeground,
        fontWeight: '500',
    },
    value: {
        fontSize: typography.sizes.sm,
        color: colors.foreground,
        fontWeight: '600',
    },
});
