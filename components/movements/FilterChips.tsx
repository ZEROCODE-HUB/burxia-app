import React, { useMemo } from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { spacing, borderRadius, typography } from '../../theme';
import { useTheme } from '../../context/ThemeContext';

export type FilterType = string;

interface FilterOption {
    id: string;
    label: string;
}

interface FilterChipsProps {
    activeFilter: string;
    onFilterChange: (filter: string) => void;
    options?: FilterOption[];
}

const DEFAULT_FILTERS: FilterOption[] = [
    { id: 'todos', label: 'Todos' },
    { id: 'ingresos', label: 'Ingresos' },
    { id: 'egresos', label: 'Egresos' },
    { id: 'fechas', label: 'Fechas' },
];

export const FilterChips: React.FC<FilterChipsProps> = ({
    activeFilter,
    onFilterChange,
    options = DEFAULT_FILTERS
}) => {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.container}
        >
            {options.map((filter) => {
                const isActive = activeFilter === filter.id;
                return (
                    <TouchableOpacity
                        key={filter.id}
                        onPress={() => onFilterChange(filter.id)}
                        style={[
                            styles.chip,
                            isActive && styles.activeChip
                        ]}
                    >
                        <Text style={[
                            styles.label,
                            isActive && styles.activeLabel
                        ]}>
                            {filter.label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </ScrollView>
    );
};

const createStyles = (colors: any) => StyleSheet.create({
    container: {
        paddingHorizontal: spacing.lg,
        gap: spacing.sm,
        paddingVertical: spacing.sm,
    },
    chip: {
        paddingHorizontal: spacing.md,
        paddingVertical: 6,
        borderRadius: borderRadius.full,
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.border,
    },
    activeChip: {
        backgroundColor: colors.accent,
        borderColor: colors.accent,
    },
    label: {
        fontSize: typography.sizes.sm,
        color: colors.mutedForeground,
        fontWeight: '500',
    },
    activeLabel: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
});
