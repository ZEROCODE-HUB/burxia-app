import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import { spacing, borderRadius } from '../../theme';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { LogoIcon } from '../LogoIcon';
import { BRAND_NAME } from '../../constants/brand';
import { AlertDialog } from '../ui';
import { NAV_ITEMS, NAV_GROUP_ORDER, NAV_GROUP_TITLES } from '../../constants/navItems';

const STORAGE_KEY = 'bruxia.sidebar.collapsed';

function readCollapsed(): boolean {
  try { return (globalThis as any)?.localStorage?.getItem(STORAGE_KEY) === '1'; } catch { return false; }
}

/**
 * Sidebar de escritorio (Nivel B). Comparte la navegación con el móvil
 * (`constants/navItems.ts`) con el lenguaje visual del login. Se puede
 * colapsar a un rail de íconos (estado persistido en localStorage).
 */
export function DesktopSidebar() {
  const { colors } = useTheme();
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState<boolean>(readCollapsed);
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const toggle = () => {
    setCollapsed((c) => {
      const next = !c;
      try { (globalThis as any)?.localStorage?.setItem(STORAGE_KEY, next ? '1' : '0'); } catch {}
      return next;
    });
  };

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
    <LinearGradient
      colors={['#2D2154', '#241A45', '#17122E']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={[styles.container, collapsed && styles.containerCollapsed]}
    >
      {/* Marca + toggle */}
      <View style={[styles.brand, collapsed && styles.brandCollapsed]}>
        <View style={styles.brandLeft}>
          <View style={styles.logoBadge}><LogoIcon size={26} /></View>
          {!collapsed && <Text style={styles.brandName}>{BRAND_NAME}</Text>}
        </View>
        <TouchableOpacity style={styles.toggle} onPress={toggle} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name={collapsed ? 'chevron-forward' : 'chevron-back'} size={16} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.nav} contentContainerStyle={styles.navContent} showsVerticalScrollIndicator={false}>
        {NAV_GROUP_ORDER.map((group) => {
          const items = NAV_ITEMS.filter((i) => i.group === group);
          if (items.length === 0) return null;
          return (
            <View key={group} style={styles.section}>
              {!collapsed && <Text style={styles.sectionTitle}>{NAV_GROUP_TITLES[group]}</Text>}
              {items.map((item) => {
                const active = isActive(item.path);
                return (
                  <TouchableOpacity
                    key={item.path}
                    style={[styles.item, collapsed && styles.itemCollapsed, active && styles.itemActive]}
                    onPress={() => router.navigate(item.path as any)}
                    activeOpacity={0.7}
                    // @ts-ignore web tooltip cuando está colapsado
                    title={collapsed ? item.label : undefined}
                  >
                    <View style={[styles.itemIcon, active && styles.itemIconActive]}>
                      <Ionicons
                        name={active && item.activeIcon ? item.activeIcon : item.icon}
                        size={18}
                        color={active ? '#FFFFFF' : 'rgba(255,255,255,0.6)'}
                      />
                    </View>
                    {!collapsed && <Text style={[styles.itemLabel, active && styles.itemLabelActive]}>{item.label}</Text>}
                  </TouchableOpacity>
                );
              })}
            </View>
          );
        })}
      </ScrollView>

      <View style={[styles.footer, collapsed && styles.footerCollapsed]}>
        {collapsed ? (
          <>
            <View style={styles.avatar}><Text style={styles.avatarText}>{initials}</Text></View>
            <TouchableOpacity style={styles.logoutIconBtn} onPress={() => setShowLogoutAlert(true)} activeOpacity={0.7} hitSlop={6}>
              <Ionicons name="log-out-outline" size={18} color="#FCA5A5" />
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View style={styles.userRow}>
              <View style={styles.avatar}><Text style={styles.avatarText}>{initials}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.userName} numberOfLines={1}>
                  {user ? `${user.first_name} ${user.last_name}` : 'Usuario'}
                </Text>
                <Text style={styles.userMail} numberOfLines={1}>{user?.email ?? ''}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.logoutBtn} onPress={() => setShowLogoutAlert(true)} activeOpacity={0.7}>
              <Ionicons name="log-out-outline" size={18} color="#FCA5A5" />
              <Text style={styles.logoutText}>Cerrar Sesión</Text>
            </TouchableOpacity>
          </>
        )}
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
    </LinearGradient>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      width: 264,
      height: '100%',
      borderRightWidth: 1,
      borderRightColor: 'rgba(255,255,255,0.08)',
    },
    containerCollapsed: { width: 84 },
    brand: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255,255,255,0.08)',
    },
    brandCollapsed: { flexDirection: 'column', gap: spacing.md, paddingHorizontal: spacing.sm },
    brandLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    logoBadge: {
      width: 40, height: 40, borderRadius: 12,
      backgroundColor: 'rgba(255,255,255,0.10)',
      alignItems: 'center', justifyContent: 'center',
    },
    brandName: { fontSize: 20, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.4 },
    toggle: {
      width: 28, height: 28, borderRadius: 8,
      backgroundColor: 'rgba(255,255,255,0.08)',
      alignItems: 'center', justifyContent: 'center',
    },
    nav: { flex: 1 },
    navContent: { padding: spacing.md, gap: spacing.lg },
    section: { gap: 2 },
    sectionTitle: {
      fontSize: 10.5, fontWeight: '700', color: 'rgba(255,255,255,0.40)',
      textTransform: 'uppercase', letterSpacing: 1.2,
      paddingHorizontal: spacing.sm, paddingBottom: spacing.xs,
    },
    item: {
      flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
      paddingVertical: 9, paddingHorizontal: 10,
      borderRadius: 12,
    },
    itemCollapsed: { justifyContent: 'center', paddingHorizontal: 0 },
    itemActive: {
      backgroundColor: 'rgba(139,123,214,0.16)',
      borderWidth: 1, borderColor: 'rgba(91,163,232,0.30)',
      boxShadow: '0 4px 14px rgba(139,123,214,0.18)' as any,
    },
    itemIcon: {
      width: 34, height: 34, borderRadius: 10,
      backgroundColor: 'rgba(255,255,255,0.06)',
      alignItems: 'center', justifyContent: 'center',
    },
    itemIconActive: { backgroundColor: colors.accent },
    itemLabel: { fontSize: 14, fontWeight: '500', color: 'rgba(255,255,255,0.62)' },
    itemLabelActive: { color: '#FFFFFF', fontWeight: '700' },
    footer: {
      borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)',
      padding: spacing.md, gap: spacing.sm,
    },
    footerCollapsed: { alignItems: 'center', gap: spacing.md },
    userRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    avatar: {
      width: 38, height: 38, borderRadius: 19, backgroundColor: colors.accent,
      justifyContent: 'center', alignItems: 'center',
    },
    avatarText: { color: '#fff', fontWeight: '800', fontSize: 14 },
    userName: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
    userMail: { fontSize: 11, color: 'rgba(255,255,255,0.5)' },
    logoutBtn: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
      paddingVertical: 10, borderRadius: borderRadius.md,
      borderWidth: 1, borderColor: 'rgba(252,165,165,0.3)',
      backgroundColor: 'rgba(231,76,60,0.10)',
    },
    logoutText: { color: '#FCA5A5', fontWeight: '700', fontSize: 13 },
    logoutIconBtn: {
      width: 40, height: 40, borderRadius: 12,
      borderWidth: 1, borderColor: 'rgba(252,165,165,0.3)', backgroundColor: 'rgba(231,76,60,0.10)',
      alignItems: 'center', justifyContent: 'center',
    },
  });
