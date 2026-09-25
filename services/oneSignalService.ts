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
import { getLocalDeviceId } from './auth.service';

class OneSignalService {
    private isInitialized = false;

    /**
     * Lee el OneSignal App ID. Estrategia de credenciales remotas: primero se
     * busca en la tabla pública `app_config` de Supabase (así se puede cargar
     * DESPUÉS del build, sin recompilar); si no hay valor, cae al valor local
     * de `app.config.js` (extra.oneSignalAppId, vía .env). El App ID de
     * OneSignal es una clave pública de cliente, no un secreto.
     */
    private async resolveAppId(): Promise<string | null> {
        try {
            // Lista blanca en el servidor (public_runtime_config): app_config no
            // es legible por el cliente; esta RPC solo devuelve claves públicas.
            const { data, error } = await supabase.rpc('public_runtime_config' as any, { p_key: 'onesignal_app_id' });
            const remote = typeof data === 'string' ? data.trim() : '';
            if (!error && remote) return remote;
        } catch {
            /* sin conexión / tabla ausente: se usa el fallback local */
        }
        const local = Constants.expoConfig?.extra?.oneSignalAppId;
        return local ? String(local) : null;
    }

    /**
     * Inicializa OneSignal
     * Llamar una sola vez al inicio de la app
     */
    async initialize() {
        // OneSignal es un SDK de push SOLO-NATIVO. En web sus métodos pueden
        // devolver promesas que nunca resuelven; como se lo llama en flujos de
        // auth (login/logout), eso cuelga la app en el navegador. En web no hay
        // push por acá, así que es un no-op.
        if (Platform.OS === 'web') return;
        if (this.isInitialized) {
            console.log('OneSignal ya está inicializado');
            return;
        }

        const appId = await this.resolveAppId();

        if (!appId) {
            console.log('ℹ️ OneSignal App ID no configurado (Supabase app_config ni .env); push deshabilitado.');
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
        if (Platform.OS === 'web') return; // push solo-nativo; no-op en web
        if (!this.isInitialized) {
            // Sin App ID (no configurado en app_config ni .env) OneSignal no se
            // inicializó; llamar a login() aquí crashea con "Must call
            // 'initWithContext' before 'login'". Se omite silenciosamente.
            console.log('ℹ️ OneSignal no inicializado; se omite loginUser.');
            return;
        }
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
        if (Platform.OS === 'web') return; // push solo-nativo; no-op en web
        if (!this.isInitialized) {
            return;
        }
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
            
            // Use exactly the same local device id used for Authentication
            const deviceId = await getLocalDeviceId();

            // ✅ CORREGIDO: Llamar al RPC en Supabase para reclamar el device sin violar unique constraints ni RLS
            const rpcArgs = {
                p_player_id: playerId,
                p_device_id: deviceId,
                p_user_id: user.id,
                p_platform: Platform.OS as 'ios' | 'android',
                p_push_enabled: optedIn,
                p_device_os_version: String(Platform.Version),
                p_app_version: Constants.expoConfig?.version || '1.0.0'
            };

            console.log('💾 Llamando RPC para guardar dispositivo:', rpcArgs);

            const { error: rpcError } = await supabase.rpc('claim_onesignal_device', rpcArgs as any);

            if (rpcError) {
                console.error('❌ Error al ganar ownership del dispositivo usando RPC:', rpcError);
                
                // Fallback extremo por si el RPC no existe aún o falla (solo UPSERT normal sin limpieza agresiva)
                console.warn('⚠️ Intentando Upsert normal de Fallback...');
                const deviceData = {
                    user_id: user.id,
                    device_id: deviceId, // Secure local device id
                    player_id: playerId, // OneSignal id
                    platform: Platform.OS as 'ios' | 'android',
                    push_enabled: optedIn,
                    device_os_version: String(Platform.Version),
                    app_version: Constants.expoConfig?.version || '1.0.0',
                    last_active_at: new Date().toISOString(),
                    is_active: true
                };

                const { error: fallbackError } = await (supabase.from('user_devices') as any).upsert(deviceData, {
                    onConflict: 'user_id,device_id'
                });

                if (fallbackError) {
                     console.error('❌ Error al guardar dispositivo (fallback):', fallbackError);
                } else {
                     console.log('✅ Dispositivo guardado en BD (vía Fallback):', playerId);
                }
            } else {
                console.log('✅ Dispositivo guardado exitosamente en BD (vía RPC):', playerId);
            }
        } catch (error) {
            console.error('❌ Error en saveDeviceToDatabase:', error);
        }
    }

    /**
     * Obtiene un ID único del dispositivo (Ya no se usa localmente, pero se mantiene por compatibilidad)
     */
    private async getDeviceId(playerId?: string): Promise<string> {
        try {
            // Utilizamos la misma funcion base del auth para no perder coherencia
            return await getLocalDeviceId();
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
        if (!this.isInitialized) {
            console.log('ℹ️ OneSignal no inicializado; no se puede cambiar el estado de push.');
            return;
        }
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

                const { error } = await (supabase
                    .from('user_devices') as any)
                    .update({ push_enabled: enabled })
                    .eq('user_id', user.id)
                    .eq('player_id', playerId || '');

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
        if (!this.isInitialized) {
            return { playerId: null, token: null, optedIn: false };
        }
        return {
            playerId: await OneSignal.User.pushSubscription.getIdAsync(),
            token: await OneSignal.User.pushSubscription.getTokenAsync(),
            optedIn: await OneSignal.User.pushSubscription.getOptedInAsync()
        };
    }
}

// Exportar instancia única (singleton)
export const oneSignalService = new OneSignalService();