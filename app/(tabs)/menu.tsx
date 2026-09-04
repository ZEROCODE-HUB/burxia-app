import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenHeader } from '../../components/layout';
import { spacing, borderRadius, typography } from '../../theme';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { AlertDialog } from '../../components/ui';
import { NAV_ITEMS, NAV_GROUP_ORDER, NAV_GROUP_TITLES } from '../../constants/navItems';

interface MenuItemProps {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    description?: string;
    path: string;
    variant?: 'default' | 'destructive';
    onPress?: () => void;
}

const MenuItem: React.FC<MenuItemProps & { colors: any }> = ({ icon, label, description, path, variant = 'default', colors, onPress }) => {
    const isDestructive = variant === 'destructive';
    const styles = useMemo(() => createStyles(colors), [colors]);

    return (
        <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
                if (onPress) {
                    onPress();
                } else if (path === '/login') {
                    router.replace('/login');
                } else {
                    router.push(path as any);
                }
            }}
            activeOpacity={0.7}
        >
            <View style={[
                styles.iconContainer,
                isDestructive ? styles.iconContainerDestructive : styles.iconContainerDefault
            ]}>
                <Ionicons
                    name={icon}
                    size={24}
                    color={isDestructive ? colors.destructive : colors.mutedForeground}
                />
            </View>
            <View style={styles.menuItemContent}>
                <Text style={[styles.menuItemLabel, isDestructive && styles.textDestructive]}>{label}</Text>
                {description && <Text style={styles.menuItemDescription}>{description}</Text>}
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.mutedForeground} />
        </TouchableOpacity>
    );
};

export default function MenuScreen() {
    const { colors } = useTheme();
    const { user, logout } = useAuth();
    const insets = useSafeAreaInsets();
    const [showLogoutAlert, setShowLogoutAlert] = React.useState(false);
    const [isLoggingOut, setIsLoggingOut] = React.useState(false);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await logout();
            // Navigation handled by AuthContext/_layout.tsx
            // We just let the modal close smoothly
            setShowLogoutAlert(false);
        } catch (error) {
            console.error("Logout failed:", error);
            setIsLoggingOut(false);
        }
    };

    const styles = useMemo(() => createStyles(colors), [colors]);

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <ScreenHeader
                title="Menú"
                showBackButton={true}
                userName={user?.first_name || "Usuario"}
                onBack={() => {
                    if (router.canGoBack()) {
                        router.back();
                    } else {
                        router.push('/');
                    }
                }}
            />

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: insets.bottom + 60 }}
            >
                <View style={styles.content}>
                    {/* Navegación desde la fuente única constants/navItems.ts */}
                    {NAV_GROUP_ORDER.map((group) => {
                        const items = NAV_ITEMS.filter((i) => i.group === group);
                        const isAjustes = group === 'ajustes';
                        if (items.length === 0 && !isAjustes) return null;
                        return (
                            <View key={group} style={styles.section}>
                                <Text style={styles.sectionTitle}>{NAV_GROUP_TITLES[group]}</Text>
                                <View style={styles.sectionCard}>
                                    {items.map((item, idx) => (
                                        <React.Fragment key={item.path}>
                                            {idx > 0 && <View style={styles.divider} />}
                                            <MenuItem
                                                icon={item.icon}
                                                label={item.label}
                                                description={item.description}
                                                path={item.path}
                                                colors={colors}
                                            />
                                        </React.Fragment>
                                    ))}
                                    {isAjustes && (
                                        <>
                                            {items.length > 0 && <View style={styles.divider} />}
                                            <MenuItem
                                                icon="log-out-outline"
                                                label="Cerrar Sesión"
                                                description="Salir de tu cuenta"
                                                path="/login"
                                                variant="destructive"
                                                colors={colors}
                                                onPress={() => setShowLogoutAlert(true)}
                                            />
                                        </>
                                    )}
                                </View>
                            </View>
                        );
                    })}
                </View>

                {/* Footer space */}
                <View style={{ height: spacing['2xl'] }} />
            </ScrollView>

            <AlertDialog
                visible={showLogoutAlert}
                title="Cerrar Sesión"
                description="¿Estás seguro que quieres salir de tu cuenta?"
                confirmLabel="Salir"
                cancelLabel="Cancelar"
                variant="destructive"
                icon="log-out-outline"
                loading={isLoggingOut}
                onConfirm={handleLogout}
                onClose={() => !isLoggingOut && setShowLogoutAlert(false)}
            />
        </View>
    );
}

const createStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: spacing.lg,
        gap: spacing.xl,
    },
    section: {
        gap: spacing.sm,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: colors.mutedForeground,
        textTransform: 'uppercase',
        letterSpacing: 1,
        paddingLeft: spacing.xs,
    },
    sectionCard: {
        backgroundColor: colors.card,
        borderRadius: borderRadius.xl,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: 'hidden',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        gap: spacing.md,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: borderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconContainerDefault: {
        backgroundColor: colors.mutedAlpha[30],
    },
    iconContainerDestructive: {
        backgroundColor: colors.destructiveAlpha[10],
    },
    menuItemContent: {
        flex: 1,
    },
    menuItemLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.foreground,
    },
    textDestructive: {
        color: colors.destructive,
    },
    menuItemDescription: {
        fontSize: 12,
        color: colors.mutedForeground,
        marginTop: 2,
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
        marginHorizontal: spacing.md,
    }
});
