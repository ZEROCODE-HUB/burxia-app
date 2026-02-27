import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, typography, borderRadius } from '../../theme';
import { useTheme } from '../../context/ThemeContext';

interface MenuItem {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    subtitle?: string;
    onPress: () => void;
}

interface MenuSectionProps {
    title: string;
    items: MenuItem[];
}

export const MenuSection: React.FC<MenuSectionProps> = ({ title, items }) => {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{title}</Text>
            <View style={styles.card}>
                {items.map((item, index) => (
                    <TouchableOpacity
                        key={item.label}
                        onPress={item.onPress}
                        style={[
                            styles.item,
                            index < items.length - 1 && styles.borderBottom
                        ]}
                    >
                        <View style={styles.left}>
                            <View style={styles.iconBox}>
                                <Ionicons name={item.icon} size={20} color={colors.accent} />
                            </View>
                            <View>
                                <Text style={styles.label}>{item.label}</Text>
                                {item.subtitle && <Text style={styles.subtitle}>{item.subtitle}</Text>}
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.mutedForeground} />
                    </TouchableOpacity>
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
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: spacing.md,
    },
    borderBottom: {
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    left: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: borderRadius.lg,
        backgroundColor: colors.accentAlpha[10],
        justifyContent: 'center',
        alignItems: 'center',
    },
    label: {
        fontSize: typography.sizes.sm,
        fontWeight: '600',
        color: colors.foreground,
    },
    subtitle: {
        fontSize: 10,
        color: colors.mutedForeground,
    },
});
