import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import { spacing, borderRadius } from '../../theme';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../Logo';
import { AlertDialog } from '../ui';
import { NAV_ITEMS, NAV_GROUP_ORDER, NAV_GROUP_TITLES } from '../../constants/navItems';

/**
 * Sidebar de navegación para el layout de escritorio (Nivel B, solo web ancho).
 *
 * Se alimenta de la fuente única `constants/navItems.ts` (misma que el menú
 * móvil) y navega con expo-router, resaltando la ruta activa. El logo sale del
 * componente `Logo` central, así el rebrand gráfico se cambia en un solo lugar.
 */
export function DesktopSidebar() {
  const { colors } = useTheme();
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [showLogoutAlert, setShowLogoutAlert] = React.useState(false);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const isActive = (path: string) =>
    path === '/' ? pathname === '/' : pathname === path || pathname.startsWith(path + '/');

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      setShowLogoutAlert(false);
    } catch (error) {
      console.error('Logout failed:', error);
      setIsLoggingOut(false);
    }
  };

  const initials = `${user?.first_name?.[0] ?? ''}${user?.last_name?.[0] ?? ''}`.toUpperCase() || 'U';

  return (
    <View style={styles.container}>
      <View style={styles.brand}>
        <Logo height={30} />
      </View>

      <ScrollView style={styles.nav} contentContainerStyle={styles.navContent} showsVerticalScrollIndicator={false}>
        {NAV_GROUP_ORDER.map((group) => {
          const items = NAV_ITEMS.filter((i) => i.group === group);
          if (items.length === 0) return null;
          return (
            <View key={group} style={styles.section}>
              <Text style={styles.sectionTitle}>{NAV_GROUP_TITLES[group]}</Text>
              {items.map((item) => {
                const active = isActive(item.path);
                return (
                  <TouchableOpacity
                    key={item.path}
                    style={[styles.item, active && styles.itemActive]}
                    onPress={() => router.navigate(item.path as any)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={active && item.activeIcon ? item.activeIcon : item.icon}
                      size={20}
                      color={active ? colors.accent : colors.mutedForeground}
                    />
                    <Text style={[styles.itemLabel, active && styles.itemLabelActive]}>{item.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.userRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.userName} numberOfLines={1}>
              {user ? `${user.first_name} ${user.last_name}` : 'Usuario'}
            </Text>
            <Text style={styles.userMail} numberOfLines={1}>{user?.email ?? ''}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => setShowLogoutAlert(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={18} color={colors.destructive} />
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>

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

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      width: 260,
      backgroundColor: colors.card,
      borderRightWidth: 1,
      borderRightColor: colors.border,
      height: '100%',
    },
    brand: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    nav: {
      flex: 1,
    },
    navContent: {
      padding: spacing.md,
      gap: spacing.lg,
    },
    section: {
      gap: 2,
    },
    sectionTitle: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.mutedForeground,
      textTransform: 'uppercase',
      letterSpacing: 1,
      paddingHorizontal: spacing.sm,
      paddingBottom: spacing.xs,
    },
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingVertical: 10,
      paddingHorizontal: spacing.sm,
      borderRadius: borderRadius.md,
    },
    itemActive: {
      backgroundColor: colors.accentAlpha[10],
    },
    itemLabel: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.mutedForeground,
    },
    itemLabelActive: {
      color: colors.foreground,
      fontWeight: '600',
    },
    footer: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
      padding: spacing.md,
      gap: spacing.sm,
    },
    userRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    avatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.accent,
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarText: {
      color: '#fff',
      fontWeight: '700',
      fontSize: 14,
    },
    userName: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.foreground,
    },
    userMail: {
      fontSize: 11,
      color: colors.mutedForeground,
    },
    logoutBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      paddingVertical: 10,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    logoutText: {
      color: colors.destructive,
      fontWeight: '600',
      fontSize: 13,
    },
  });
