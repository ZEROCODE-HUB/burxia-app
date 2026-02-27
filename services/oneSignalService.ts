// src/services/oneSignalService.ts
import {
    OneSignal,
    LogLevel,
    NotificationWillDisplayEvent,
    NotificationClickEvent,
    PushSubscriptionChangedState,
    OSNotification
} from 'react-native-onesignal';
import { router } from 'expo-router';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { supabase } from '@/lib/supabase';


class OneSignalService {
    private isInitialized = false;

    /**
     * Inicializa OneSignal
     * Llamar una sola vez al inicio de la app
     */
    initialize() {
        if (this.isInitialized) {
            console.log('OneSignal ya está inicializado');
            return;
        }

        const appId = Constants.expoConfig?.extra?.oneSignalAppId;

        if (!appId) {
            console.error('⚠️ ONESIGNAL_APP_ID no está configurado en .env');
            return;
        }

        try {
            // Inicializar OneSignal
            OneSignal.initialize(appId);

            // Configurar log level (solo en desarrollo)
            if (__DEV__) {
                OneSignal.Debug.setLogLevel(LogLevel.Verbose);
            }

            // Solicitar permisos de notificaciones
            this.requestPermissions();

            // Configurar listeners
            this.setupListeners();

            this.isInitialized = true;
            console.log('✅ OneSignal inicializado correctamente');
        } catch (error) {
            console.error('❌ Error al inicializar OneSignal:', error);
        }
    }

    /**
     * Solicita permisos de notificaciones al usuario
     */
    private async requestPermissions() {
        try {
            // iOS: muestra el prompt nativo
            // Android: no necesita prompt explícito
            const permission = await OneSignal.Notifications.requestPermission(true);
            console.log('Permiso de notificaciones:', permission);
        } catch (error) {
            console.error('Error al solicitar permisos:', error);
        }
    }

    /**
     * Configura los listeners de eventos
     */
    private setupListeners() {
        // Listener: cuando se recibe una notificación (app en foreground)
        OneSignal.Notifications.addEventListener(
            'foregroundWillDisplay',
            (event: NotificationWillDisplayEvent) => {
                console.log('📩 Notificación recibida en foreground:', event.notification);
                // Mostrar la notificación
                event.preventDefault();
                event.notification.display();
            }
        );

        // Listener: cuando el usuario toca la notificación
        OneSignal.Notifications.addEventListener(
            'click',
            (event: NotificationClickEvent) => {
                console.log('👆 Usuario tocó la notificación:', event.notification);
                this.handleNotificationClick(event.notification);
            }
        );

        // Listener: cambios en la suscripción
        OneSignal.User.pushSubscription.addEventListener(
            'change',
            (subscription: PushSubscriptionChangedState) => {
                console.log('🔄 Cambio en la suscripción:', subscription);
                if (subscription.current.id) {
                    this.saveDeviceToDatabase(subscription.current.id);
                }
            }
        );
    }

    /**
     * Vincula el usuario actual con OneSignal (External ID)
     * Llamar después del login exitoso
     */
    async loginUser(userId: string) {
        try {
            console.log('🔗 Vinculando usuario a OneSignal:', userId);
            await OneSignal.login(userId);

            // Obtener el player_id actual
            const playerId = await OneSignal.User.pushSubscription.getIdAsync();
            if (playerId) {
                await this.saveDeviceToDatabase(playerId);
            }

            console.log('✅ Usuario vinculado correctamente');
        } catch (error) {
            console.error('❌ Error al vincular usuario:', error);
        }
    }

    /**
     * Desvincula el usuario de OneSignal
     * Llamar al hacer logout
     */
    async logoutUser() {
        try {
            console.log('🔓 Desvinculando usuario de OneSignal');
            await OneSignal.logout();
            console.log('✅ Usuario desvinculado correctamente');
        } catch (error) {
            console.error('❌ Error al desvincular usuario:', error);
        }
    }

    /**
     * Guarda/actualiza el dispositivo en Supabase
     */
    private async saveDeviceToDatabase(playerId: string) {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                console.log('⚠️ No hay usuario autenticado, no se guarda el dispositivo');
                return;
            }

            // Obtener información del dispositivo
            const optedIn = await OneSignal.User.pushSubscription.getOptedInAsync();
            const deviceId = await this.getDeviceId(playerId);

            // ✅ CORREGIDO: Mapear a los campos REALES de tu tabla
            const deviceData = {
                user_id: user.id,
                device_id: deviceId,
                player_id: playerId, // ✅ Campo correcto
                platform: Platform.OS as 'ios' | 'android', // ✅ Campo correcto
                push_enabled: optedIn, // ✅ Campo correcto (boolean)
                device_name: Platform.select({ ios: 'iOS Device', android: 'Android Device' }) || 'Unknown Device',
                device_type: Platform.OS,
                device_model: 'Unknown', // expo-device removed to avoid native module errors
                device_os_version: String(Platform.Version),
                app_version: Constants.expoConfig?.version || '1.0.0',
                last_active_at: new Date().toISOString(),
                is_active: true
            };

            console.log('💾 Guardando dispositivo:', deviceData);

            const { error } = await supabase
                .from('user_devices')
                .upsert(deviceData, {
                    onConflict: 'user_id,device_id'
                });

            if (error) {
                console.error('❌ Error al guardar dispositivo:', error);
            } else {
                console.log('✅ Dispositivo guardado en BD:', playerId);
            }
        } catch (error) {
            console.error('❌ Error en saveDeviceToDatabase:', error);
        }
    }

    /**
     * Obtiene un ID único del dispositivo
     */
    private async getDeviceId(playerId?: string): Promise<string> {
        try {
            // Fallback: usar el player_id si está disponible
            if (playerId) return playerId;

            const existingPlayerId = await OneSignal.User.pushSubscription.getIdAsync();
            return existingPlayerId || 'unknown';
        } catch (error) {
            console.error('Error obteniendo device_id:', error);
            return 'unknown';
        }
    }

    /**
     * Maneja el click en una notificación
     */
    private handleNotificationClick(notification: OSNotification) {
        const data = notification.additionalData as any;

        console.log('📨 Data de la notificación:', data);

        // Navegar según el tipo de notificación
        if (data?.type === 'transaction' && data?.transaction_id) {
            console.log('Navegar a transacción:', data.transaction_id);

            // TODO: Ajustar esta ruta según tu estructura de navegación
            router.push({
                pathname: '/(tabs)/transactions/[id]',
                params: { id: data.transaction_id }
            });
        }
    }

    /**
     * Activa/desactiva las notificaciones push en este dispositivo
     */
    async togglePushNotifications(enabled: boolean) {
        try {
            if (enabled) {
                await OneSignal.Notifications.requestPermission(true);
            } else {
                OneSignal.User.pushSubscription.optOut();
            }

            // Actualizar en la base de datos
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const playerId = await OneSignal.User.pushSubscription.getIdAsync();

                const { error } = await supabase
                    .from('user_devices')
                    .update({ push_enabled: enabled }) // ✅ Campo correcto
                    .eq('user_id', user.id)
                    .eq('player_id', playerId); // ✅ Campo correcto

                if (error) {
                    console.error('Error al actualizar push_enabled:', error);
                } else {
                    console.log(`✅ Notificaciones ${enabled ? 'activadas' : 'desactivadas'}`);
                }
            }
        } catch (error) {
            console.error('❌ Error al cambiar estado de notificaciones:', error);
        }
    }

    /**
     * Obtiene el estado actual de las notificaciones
     */
    async getPushSubscriptionState() {
        return {
            playerId: await OneSignal.User.pushSubscription.getIdAsync(),
            token: await OneSignal.User.pushSubscription.getTokenAsync(),
            optedIn: await OneSignal.User.pushSubscription.getOptedInAsync()
        };
    }
}

// Exportar instancia única (singleton)
export const oneSignalService = new OneSignalService();