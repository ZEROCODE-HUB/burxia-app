import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { spacing, borderRadius } from '../../theme';
import { useTheme } from '../../context/ThemeContext';

interface TimeRangeOption {
    id: string;
    label: string;
}

interface TimeRangeSelectorProps {
    options: TimeRangeOption[];
    selected: string;
    onSelect: (id: string) => void;
}

export const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({
    options,
    selected,
    onSelect,
}) => {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    return (
        <View style={styles.container}>
            {options.map((option) => {
                const isActive = selected === option.id;
                return (
                    <TouchableOpacity
                        key={option.id}
                        onPress={() => onSelect(option.id)}
                        style={[
                            styles.option,
                            isActive && styles.activeOption
                        ]}
                    >
                        <Text style={[
                            styles.label,
                            isActive && styles.activeLabel
                        ]}>
                            {option.label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

const createStyles = (colors: any) => StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: colors.mutedAlpha[20],
        borderRadius: borderRadius.lg,
        padding: 4,
        borderWidth: 1,
        borderColor: colors.border,
        width: '100%',
    },
    option: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: borderRadius.md,
    },
    activeOption: {
        backgroundColor: colors.accent,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 1,
        elevation: 2,
    },
    label: {
        fontSize: 12,
        color: colors.mutedForeground,
        fontWeight: '500',
    },
    activeLabel: {
        color: colors.accentForeground,
        fontWeight: '600',
    },
});
