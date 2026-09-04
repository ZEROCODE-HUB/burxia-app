import { Platform, useWindowDimensions } from 'react-native';

/**
 * Breakpoint a partir del cual se usa el layout de escritorio (Nivel B):
 * sidebar de navegación + contenido centrado, en vez del marco tipo teléfono.
 */
export const DESKTOP_BREAKPOINT = 900;

/**
 * true solo en web y cuando el ancho de ventana alcanza el breakpoint de
 * escritorio. En iOS/Android siempre false (la app es mobile-first).
 */
export function useIsDesktop(): boolean {
  const { width } = useWindowDimensions();
  return Platform.OS === 'web' && width >= DESKTOP_BREAKPOINT;
}
