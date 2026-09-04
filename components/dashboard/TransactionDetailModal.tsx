import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Modal } from '../ui/Modal';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { useTheme } from '../../context/ThemeContext';
import { formatCurrency } from '../../utils/formatters';
import { PaymentMethod, TransactionStatus } from '../../types/database.types';

interface TransactionDetailData {
    transaction_id?: string;
    id?: string;
    created_at?: string;
    completed_at?: string | null;
    amount?: number;
    concept?: string | null;
    payment_method?: PaymentMethod;
    reference_number?: string;
    category?: string;
    transaction_type_name?: string;
    movement_type?: string;
    status?: TransactionStatus;
    counterpart_name?: string | null;
    title?: string;
    description?: string;
}

interface TransactionDetailModalProps {
    visible: boolean;
    onClose: () => void;
    transaction: TransactionDetailData | null;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
    completed: { label: 'Completada', color: colors.success, bg: 'rgba(34, 197, 94, 0.12)', icon: 'checkmark-circle' },
    pending: { label: 'Pendiente', color: colors.warning, bg: 'rgba(245, 158, 11, 0.12)', icon: 'time' },
    processing: { label: 'En proceso', color: colors.accent, bg: 'rgba(59, 130, 246, 0.12)', icon: 'sync' },
    failed: { label: 'Fallida', color: colors.destructive, bg: 'rgba(239, 68, 68, 0.12)', icon: 'close-circle' },
    cancelled: { label: 'Cancelada', color: colors.mutedForeground, bg: 'rgba(100, 116, 139, 0.12)', icon: 'ban' },
    reversed: { label: 'Reversada', color: colors.destructive, bg: 'rgba(239, 68, 68, 0.12)', icon: 'arrow-undo-circle' },
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
    alias: 'Alias',
    cvu: 'CVU',
    cbu: 'CBU',
    qr: 'Código QR',
};

const formatPaymentMethod = (method?: PaymentMethod) => {
    if (!method) return '—';
    return PAYMENT_METHOD_LABELS[method] || method.charAt(0).toUpperCase() + method.slice(1);
};

const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return `${date.toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    })} · ${date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
};

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
    visible,
    onClose,
    transaction,
}) => {
    const { colors } = useTheme();

    const styles = useMemo(() => createStyles(colors), [colors]);

    const isIncome = transaction?.movement_type === 'income';

    const amount = useMemo(() => {
        if (!transaction) return null;
        const raw = transaction.amount ?? 0;
        const income = transaction.movement_type === 'income';
        return {
            text: formatCurrency(raw, { showSign: true }),
            isIncome: income,
        };
    }, [transaction]);

    const status = useMemo(() => {
        const key = transaction?.status || 'completed';
        const config = STATUS_CONFIG[key] || STATUS_CONFIG.completed;
        return {
            label: config.label,
            color: config.color,
            bg: config.bg,
            icon: config.icon,
        };
    }, [transaction?.status]);

    if (!transaction) return null;

    const iconName = isIncome ? 'arrow-down' : 'arrow-up';
    const title = transaction.title
        || transaction.counterpart_name
        || transaction.transaction_type_name
        || 'Movimiento';
    const subtitle = transaction.description
        || transaction.transaction_type_name
        || 'Transacción';

    const categoryLabel = (transaction.category || transaction.transaction_type_name || '—').trim();
    const details: { label: string; value: string; icon: string; fullWidth?: boolean }[] = [
        {
            label: 'Fecha',
            value: formatDateTime(transaction.created_at),
            icon: 'calendar-outline',
            fullWidth: true,
        },
        {
            label: 'Tipo',
            value: isIncome ? 'Ingreso' : 'Egreso',
            icon: isIncome ? 'arrow-down-outline' : 'arrow-up-outline',
        },
        {
            label: 'Medio de pago',
            value: formatPaymentMethod(transaction.payment_method),
            icon: 'card-outline',
        },
        {
            label: 'Categoría',
            value: categoryLabel.charAt(0).toUpperCase() + categoryLabel.slice(1),
            icon: 'pricetag-outline',
        },
        {
            label: 'N° de referencia',
            value: transaction.reference_number || transaction.transaction_id || '—',
            icon: 'receipt-outline',
        },
        {
            label: 'Concepto',
            value: transaction.concept || 'Sin concepto',
            icon: 'document-text-outline',
        },
        {
            label: 'Contraparte',
            value: transaction.counterpart_name || '—',
            icon: 'person-outline',
        },
    ];

    return (
        <Modal visible={visible} onClose={onClose} anchor="bottom">
            <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
                <View style={styles.handle} />

                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Detalle del movimiento</Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        <Ionicons name="close" size={22} color={colors.mutedForeground} />
                    </TouchableOpacity>
                </View>

                <View style={styles.hero}>
                    <View style={[styles.heroIcon, isIncome ? styles.incomeIconBg : styles.expenseIconBg]}>
                        <Ionicons
                            name={iconName as any}
                            size={22}
                            color={isIncome ? colors.success : colors.foreground}
                        />
                    </View>

                    <Text style={styles.title} numberOfLines={2}>{title}</Text>
                    <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>

                    <Text style={[styles.amount, isIncome ? styles.incomeAmount : styles.expenseAmount]}>
                        {amount?.text}
                    </Text>

                    <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                        <Ionicons name={status.icon as any} size={14} color={status.color} />
                        <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
                    </View>
                </View>

                <View style={styles.detailsSection}>
                    {details.map((detail) => (
                        <View
                            key={detail.label}
                            style={[
                                styles.infoCell,
                                detail.fullWidth && styles.infoCellFull,
                            ]}
                        >
                            <View style={styles.infoCellHeader}>
                                <Ionicons name={detail.icon as any} size={14} color={colors.mutedForeground} />
                                <Text style={styles.infoCellLabel}>{detail.label}</Text>
                            </View>
                            <Text style={styles.infoCellValue} numberOfLines={detail.fullWidth ? 2 : 3}>
                                {detail.value}
                            </Text>
                        </View>
                    ))}
                </View>

                <TouchableOpacity style={styles.closeAction} onPress={onClose}>
                    <Text style={styles.closeActionText}>Cerrar</Text>
                </TouchableOpacity>
            </ScrollView>
        </Modal>
    );
};

const createStyles = (colors: any) => StyleSheet.create({
    handle: {
        alignSelf: 'center',
        width: 40,
        height: 4,
        borderRadius: borderRadius.full,
        backgroundColor: colors.border,
        marginBottom: spacing.md,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.base,
    },
    headerTitle: {
        fontSize: typography.sizes.base,
        fontWeight: '600',
        color: colors.mutedForeground,
    },
    closeButton: {
        padding: spacing.xs,
    },
    hero: {
        alignItems: 'center',
        marginBottom: spacing.base,
    },
    heroIcon: {
        width: 48,
        height: 48,
        borderRadius: borderRadius.full,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    incomeIconBg: {
        backgroundColor: 'rgba(34, 197, 94, 0.12)',
    },
    expenseIconBg: {
        backgroundColor: 'rgba(100, 116, 139, 0.15)',
    },
    title: {
        fontSize: typography.sizes.xl,
        fontWeight: '700',
        color: colors.foreground,
        textAlign: 'center',
        marginBottom: spacing.xs,
    },
    subtitle: {
        fontSize: typography.sizes.sm,
        color: colors.mutedForeground,
        marginBottom: spacing.base,
    },
    amount: {
        fontSize: typography.sizes['3xl'],
        fontWeight: '800',
        marginBottom: spacing.base,
    },
    incomeAmount: {
        color: colors.success,
    },
    expenseAmount: {
        color: colors.foreground,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.full,
    },
    statusText: {
        fontSize: typography.sizes.sm,
        fontWeight: '600',
    },
    detailsSection: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.base,
        marginBottom: spacing.lg,
    },
    infoCell: {
        flexBasis: '47%',
        flexGrow: 1,
        backgroundColor: colors.mutedAlpha[10],
        borderRadius: borderRadius.lg,
        padding: spacing.base,
        gap: spacing.xs,
    },
    infoCellFull: {
        flexBasis: '100%',
    },
    infoCellHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    infoCellLabel: {
        fontSize: typography.sizes.xs,
        color: colors.mutedForeground,
        textTransform: 'uppercase',
        letterSpacing: 0.3,
    },
    infoCellValue: {
        fontSize: typography.sizes.base,
        fontWeight: '600',
        color: colors.foreground,
    },
    closeAction: {
        backgroundColor: colors.accent,
        paddingVertical: spacing.base,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    closeActionText: {
        color: colors.accentForeground,
        fontSize: typography.sizes.base,
        fontWeight: '700',
    },
});