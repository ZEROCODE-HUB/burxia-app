import { Ionicons } from '@expo/vector-icons';

/**
 * Fuente ÚNICA de navegación de la app. La consumen tanto el menú móvil
 * (`app/(tabs)/menu.tsx`) como el sidebar de escritorio
 * (`components/layout/DesktopSidebar.tsx`). Para agregar/quitar una entrada,
 * editá SOLO este arreglo.
 *
 * Nota: la barra de tabs inferior (`app/(tabs)/_layout.tsx`) es una vista fija
 * de 5 destinos y se configura aparte en el propio layout de Expo Router.
 */
export type NavGroup = 'principal' | 'acciones' | 'ajustes';

export interface NavItem {
  icon: keyof typeof Ionicons.glyphMap;
  /** Ícono relleno para el estado activo (sidebar). Cae al outline si falta. */
  activeIcon?: keyof typeof Ionicons.glyphMap;
  label: string;
  description?: string;
  /** Ruta de expo-router (absoluta). */
  path: string;
  group: NavGroup;
}

export const NAV_GROUP_TITLES: Record<NavGroup, string> = {
  principal: 'Principal',
  acciones: 'Acciones Rápidas',
  ajustes: 'Ajustes',
};

export const NAV_ITEMS: NavItem[] = [
  // Principal
  { icon: 'home-outline', activeIcon: 'home', label: 'Inicio', description: 'Panel principal', path: '/', group: 'principal' },
  { icon: 'swap-vertical-outline', activeIcon: 'swap-vertical', label: 'OTC', description: 'Comprar / Vender USDT', path: '/otc', group: 'principal' },
  { icon: 'swap-horizontal-outline', activeIcon: 'swap-horizontal', label: 'Transferir', description: 'Enviar dinero', path: '/transfer', group: 'principal' },
  { icon: 'receipt-outline', activeIcon: 'receipt', label: 'Movimientos', description: 'Historial de transacciones', path: '/movements', group: 'principal' },
  { icon: 'stats-chart-outline', activeIcon: 'stats-chart', label: 'Estadísticas', description: 'Análisis de gastos', path: '/statistics', group: 'principal' },
  { icon: 'person-outline', activeIcon: 'person', label: 'Perfil', description: 'Tu información', path: '/profile', group: 'principal' },

  // Acciones rápidas
  { icon: 'arrow-down-circle-outline', activeIcon: 'arrow-down-circle', label: 'Depositar', description: 'Cargar saldo a tu cuenta', path: '/deposit', group: 'acciones' },
  { icon: 'arrow-up-circle-outline', activeIcon: 'arrow-up-circle', label: 'Retirar', description: 'Retirar dinero de tu cuenta', path: '/withdraw', group: 'acciones' },
  { icon: 'qr-code-outline', activeIcon: 'qr-code', label: 'Escanear QR', description: 'Pagar con código QR', path: '/qr', group: 'acciones' },
  { icon: 'share-social-outline', activeIcon: 'share-social', label: 'Compartir cuenta', description: 'Compartir tu información', path: '/share-cvu', group: 'acciones' },
  { icon: 'phone-portrait-outline', activeIcon: 'phone-portrait', label: 'Dispositivos', description: 'Dispositivos vinculados', path: '/profile/devices', group: 'acciones' },

  // Ajustes
  { icon: 'code-working-outline', activeIcon: 'code-working', label: 'API', description: 'Configuración de API', path: '/api-config', group: 'ajustes' },
  { icon: 'settings-outline', activeIcon: 'settings', label: 'Configuración', description: 'Ajustes de la cuenta', path: '/settings', group: 'ajustes' },
];

export const NAV_GROUP_ORDER: NavGroup[] = ['principal', 'acciones', 'ajustes'];
