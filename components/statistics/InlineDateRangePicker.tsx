import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { spacing, borderRadius } from '../../theme';
import { useTheme } from '../../context/ThemeContext';

interface InlineDateRangePickerProps {
    startDate?: Date;
    endDate?: Date;
    onApply: (start: Date, end: Date) => void;
}

export const InlineDateRangePicker: React.FC<InlineDateRangePickerProps> = ({
    startDate,
    endDate,
    onApply,
}) => {
    const { colors } = useTheme();
    const [start, setStart] = useState(startDate || new Date());
    const [end, setEnd] = useState(endDate || new Date());
    const [showPicker, setShowPicker] = useState<'start' | 'end' | null>(null);
    const [isCollapsed, setIsCollapsed] = useState(false);

    const styles = useMemo(() => createStyles(colors), [colors]);

    const handleDateChange = (event: any, selectedDate?: Date) => {
        if (Platform.OS === 'android') {
            setShowPicker(null);
        }

        if (selectedDate) {
            if (showPicker === 'start') {
                setStart(selectedDate);
            } else {
                setEnd(selectedDate);
            }
        }
    };

    const handleApplyPress = () => {
        onApply(start, end);
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.header}
                onPress={() => setIsCollapsed(!isCollapsed)}
                activeOpacity={0.7}
            >
                <Text style={styles.headerTitle}>
                    {isCollapsed
                        ? `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`
                        : "Seleccionar Rango"
                    }
                </Text>
                <Ionicons
                    name={isCollapsed ? "chevron-down" : "chevron-up"}
                    size={20}
                    color={colors.mutedForeground}
                />
            </TouchableOpacity>

            {!isCollapsed && (
                <>
                    <View style={styles.row}>
                        <View style={styles.dateBlock}>
                            <Text style={styles.label}>Desde</Text>
                            <TouchableOpacity
                                style={styles.dateInput}
                                onPress={() => setShowPicker('start')}
                            >
                                <Ionicons name="calendar-outline" size={18} color={colors.mutedForeground} />
                                <Text style={styles.dateText}>{start.toLocaleDateString()}</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.dateBlock}>
                            <Text style={styles.label}>Hasta</Text>
                            <TouchableOpacity
                                style={styles.dateInput}
                                onPress={() => setShowPicker('end')}
                            >
                                <Ionicons name="calendar-outline" size={18} color={colors.mutedForeground} />
                                <Text style={styles.dateText}>{end.toLocaleDateString()}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.applyButton} onPress={handleApplyPress}>
                        <Text style={styles.applyText}>Aplicar Rango</Text>
                    </TouchableOpacity>
                </>
            )}

            {showPicker && (
                <DateTimePicker
                    value={showPicker === 'start' ? start : end}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                    maximumDate={new Date()}
                />
            )}
        </View>
    );
};

const createStyles = (colors: any) => StyleSheet.create({
    container: {
        marginTop: spacing.md,
        padding: spacing.md,
        backgroundColor: colors.card,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        borderColor: colors.border,
        gap: spacing.md,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.foreground,
    },
    row: {
        flexDirection: 'column',
        gap: spacing.md,
    },
    dateBlock: {
        gap: 4,
    },
    label: {
        fontSize: 12,
        color: colors.mutedForeground,
        fontWeight: '500',
    },
    dateInput: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        padding: spacing.sm,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.md,
        backgroundColor: colors.background,
        minHeight: 48,
    },
    dateText: {
        fontSize: 14,
        color: colors.foreground,
    },
    applyButton: {
        backgroundColor: colors.accent,
        padding: spacing.md,
        borderRadius: borderRadius.md,
        alignItems: 'center',
        marginTop: spacing.sm,
    },
    applyText: {
        color: colors.accentForeground,
        fontWeight: '600',
        fontSize: 14,
    },
});
