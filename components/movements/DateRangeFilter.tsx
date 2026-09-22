import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { spacing, borderRadius, typography } from '../../theme';
import { useTheme } from '../../context/ThemeContext';

interface DateRangeFilterProps {
    visible: boolean;
    onClose: () => void;
    onApply: (range: { from: Date; to: Date }) => void;
}

const isWeb = Platform.OS === 'web';

// <input type="date"> usa formato YYYY-MM-DD.
const toInputValue = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
};
const fromInputValue = (s: string) => {
    const [y, m, d] = s.split('-').map(Number);
    return new Date(y, (m || 1) - 1, d || 1);
};

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
    visible,
    onClose,
    onApply,
}) => {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    const [fromDate, setFromDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        return d;
    });
    const [toDate, setToDate] = useState(new Date());
    const [showPicker, setShowPicker] = useState<'from' | 'to' | null>(null);

    const handleDateChange = (event: any, selectedDate?: Date) => {
        if (Platform.OS === 'android') {
            setShowPicker(null);
        }
        if (selectedDate) {
            if (showPicker === 'from') setFromDate(selectedDate);
            else setToDate(selectedDate);
        }
    };

    const handleApply = () => {
        onApply({ from: fromDate, to: toDate });
        onClose();
    };

    // Estilo del <input type="date"> nativo del navegador (web).
    const webInputStyle = {
        width: '100%',
        boxSizing: 'border-box',
        padding: '12px 14px',
        backgroundColor: colors.background,
        color: colors.foreground,
        border: `1px solid ${colors.border}`,
        borderRadius: 12,
        fontSize: 14,
        fontFamily: 'inherit',
        outline: 'none',
        colorScheme: colors.background === '#F8F7FC' ? 'light' : 'dark',
    } as any;

    const renderDateField = (which: 'from' | 'to') => {
        const value = which === 'from' ? fromDate : toDate;
        if (isWeb) {
            return React.createElement('input', {
                type: 'date',
                value: toInputValue(value),
                max: toInputValue(new Date()),
                onChange: (e: any) => {
                    const d = fromInputValue(e.target.value);
                    if (!isNaN(d.getTime())) which === 'from' ? setFromDate(d) : setToDate(d);
                },
                style: webInputStyle,
            });
        }
        return (
            <TouchableOpacity style={styles.dateButton} onPress={() => setShowPicker(which)}>
                <Text style={styles.dateText}>{value.toLocaleDateString()}</Text>
                <Ionicons name="calendar-outline" size={20} color={colors.accent} />
            </TouchableOpacity>
        );
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
                <TouchableOpacity style={styles.container} activeOpacity={1} onPress={() => {}}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Filtrar por fechas</Text>
                        <TouchableOpacity onPress={onClose} hitSlop={8}>
                            <Ionicons name="close" size={24} color={colors.mutedForeground} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.datesContainer}>
                        <View style={styles.dateBlock}>
                            <Text style={styles.label}>Desde</Text>
                            {renderDateField('from')}
                        </View>
                        <View style={styles.dateBlock}>
                            <Text style={styles.label}>Hasta</Text>
                            {renderDateField('to')}
                        </View>
                    </View>

                    <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
                        <Text style={styles.applyButtonText}>Aplicar filtro</Text>
                    </TouchableOpacity>

                    {!isWeb && showPicker && (
                        <DateTimePicker
                            value={showPicker === 'from' ? fromDate : toDate}
                            mode="date"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={handleDateChange}
                            maximumDate={new Date()}
                        />
                    )}
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
};

const createStyles = (colors: any) => StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.lg,
    },
    container: {
        width: '100%',
        maxWidth: 460,
        backgroundColor: colors.card,
        borderRadius: borderRadius.xl,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing.lg,
        gap: spacing.lg,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: typography.sizes.lg,
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
        fontWeight: '600',
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
        paddingVertical: spacing.md,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
    },
    applyButtonText: {
        color: colors.accentForeground,
        fontWeight: '700',
        fontSize: typography.sizes.base,
    },
});
