import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../../theme';

interface DateRangeFilterProps {
    visible: boolean;
    onClose: () => void;
    onApply: (range: { from: Date; to: Date }) => void;
}

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
    visible,
    onClose,
    onApply,
}) => {
    const [fromDate, setFromDate] = useState(new Date());
    const [toDate, setToDate] = useState(new Date());
    const [showPicker, setShowPicker] = useState<'from' | 'to' | null>(null);

    const handleDateChange = (event: any, selectedDate?: Date) => {
        if (Platform.OS === 'android') {
            setShowPicker(null);
        }

        if (selectedDate) {
            if (showPicker === 'from') {
                setFromDate(selectedDate);
            } else {
                setToDate(selectedDate);
            }
        }
    };

    const handleApply = () => {
        onApply({ from: fromDate, to: toDate });
        onClose();
    };

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Filtrar por Fechas</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color={colors.mutedForeground} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.datesContainer}>
                        <View style={styles.dateBlock}>
                            <Text style={styles.label}>Desde</Text>
                            <TouchableOpacity
                                style={styles.dateButton}
                                onPress={() => setShowPicker('from')}
                            >
                                <Text style={styles.dateText}>
                                    {fromDate.toLocaleDateString()}
                                </Text>
                                <Ionicons name="calendar-outline" size={20} color={colors.accent} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.dateBlock}>
                            <Text style={styles.label}>Hasta</Text>
                            <TouchableOpacity
                                style={styles.dateButton}
                                onPress={() => setShowPicker('to')}
                            >
                                <Text style={styles.dateText}>
                                    {toDate.toLocaleDateString()}
                                </Text>
                                <Ionicons name="calendar-outline" size={20} color={colors.accent} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
                        <Text style={styles.applyButtonText}>Aplicar Filtro</Text>
                    </TouchableOpacity>

                    {showPicker && (
                        <DateTimePicker
                            value={showPicker === 'from' ? fromDate : toDate}
                            mode="date"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={handleDateChange}
                            maximumDate={new Date()} // No permitir futuro
                        />
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: spacing.lg,
    },
    container: {
        backgroundColor: colors.card,
        borderRadius: borderRadius.xl,
        padding: spacing.lg,
        gap: spacing.lg,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: typography.sizes.lg, // 18px
        fontWeight: '700',
        color: colors.foreground,
    },
    datesContainer: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    dateBlock: {
        flex: 1,
        gap: spacing.xs,
    },
    label: {
        fontSize: typography.sizes.sm,
        color: colors.mutedForeground,
        fontWeight: '500',
    },
    dateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: spacing.md,
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.md,
    },
    dateText: {
        fontSize: typography.sizes.sm,
        color: colors.foreground,
    },
    applyButton: {
        backgroundColor: colors.accent,
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
    },
    applyButtonText: {
        color: colors.accentForeground,
        fontWeight: '600',
        fontSize: typography.sizes.base,
    },
});
