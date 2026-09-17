import React, { useState, useCallback, useRef } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenHeader } from '../../components/layout';
import {
    BalanceCard,
    QuickActions,
    TransactionsList
} from '../../components/dashboard';
import type { TransactionsListHandle } from '../../components/dashboard/TransactionsList';
import { spacing } from '../../theme';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useAccount } from '../../hooks/useAccount';
import { useIsDesktop } from '../../hooks/useIsDesktop';
import { useAccountRefreshOnFocus } from '../../hooks/useAccountRefreshOnFocus';
import { DesktopDashboard } from '../../components/dashboard/DesktopDashboard';

export default function DashboardScreen() {
    const { colors, isDark } = useTheme();
    const insets = useSafeAreaInsets();
    const { user, refreshUser } = useAuth();
    const { refreshBalance } = useAccount();
    const isDesktop = useIsDesktop();
  useAccountRefreshOnFocus();
    const [refreshing, setRefreshing] = useState(false);
    const listRef = useRef<TransactionsListHandle>(null);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        // Refrescar saldo + usuario Y la lista (movimientos/solicitudes). Antes solo
        // se refrescaba el saldo, por eso el estado de una solicitud ya aprobada
        // seguía mostrándose "Pendiente" tras deslizar para recargar.
        await Promise.all([
            refreshUser(),
            refreshBalance(),
            listRef.current?.refresh() ?? Promise.resolve(),
        ]);
        setRefreshing(false);
    }, [refreshUser, refreshBalance]);

    if (isDesktop) {
        return (
            <View style={[styles.container, { backgroundColor: 'transparent' }]}>
                <StatusBar style={isDark ? "light" : "dark"} />
                <DesktopDashboard />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
            <StatusBar style={isDark ? "light" : "dark"} />
            <ScrollView
                contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 90 }]}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={colors.primary}
                        colors={[colors.primary]}
                    />
                }
            >
                <ScreenHeader
                    variant="dashboard"
                    userName={user ? `${user.first_name} ${user.last_name}`.trim() : "Usuario"}
                />

                <View style={styles.section}>
                    <BalanceCard />
                </View>

                <QuickActions />

                <TransactionsList ref={listRef} />

                {/* Padding final para scroll */}
                <View style={{ height: 80 }} />

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: spacing.xl,
    },
    section: {
        marginTop: spacing.md,
    },
});
