import { Platform } from 'react-native';

/**
 * Configuración global de la aplicación
 */
export const AppConfig = {
    // Información de la app
    appName: 'Magnate',
    version: '1.0.0',

    // Configuración de Supabase
    supabase: {
        url: 'https://mzxhyjgbbabnughknrxc.supabase.co',
        anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16eGh5amdiYmFibnVnaGtucnhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0OTk1NzYsImV4cCI6MjA4NDA3NTU3Nn0.OMPAyQoQbiZKbmN7USAbDk7C4w-glidP1p3Izt_LkRY'
    },

    // Configuración de plataforma
    platform: {
        isAndroid: Platform.OS === 'android',
        isIOS: Platform.OS === 'ios',
        isWeb: Platform.OS === 'web',
    },

    // Configuración de desarrollo
    dev: {
        enableLogging: __DEV__,
        enableDebugMode: __DEV__,
    }
};
