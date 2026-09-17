// app.config.js
export default {
    expo: {
        // NOTA DE MARCA: el nombre visible de la app vive en constants/brand.ts
        // (BRAND_NAME) para el runtime. Estos identificadores nativos (name,
        // slug, scheme, bundleIdentifier, package) los consume el build de
        // Expo/EAS y se declaran acá; si cambia la marca, actualizá ambos lados.
        name: "Burxia",
        // NOTA DE RELEASE: el projectId de EAS (extra.eas.projectId más abajo)
        // sigue siendo el de la cuenta original. Antes del primer build bajo la
        // cuenta EAS de Bruxia hay que correr `eas init` para regenerarlo; el
        // slug se ajustará a ese proyecto. Ver docs/pendientes.md.
        // slug: debe coincidir con el proyecto EAS del projectId de abajo. El
        // proyecto EAS todavía se llama "magnate-mobile" (heredado); la MARCA de la
        // app es "Burxia" (name), no este slug (identificador interno de expo.dev,
        // invisible al usuario). Para limpiarlo: renombrar el proyecto en expo.dev a
        // "bruxia-mobile" y volver a poner ese slug acá.
        slug: "magnate-mobile",
        version: "1.0.10",
        orientation: "portrait",
        icon: "./assets/icon.png",
        scheme: "bruxia",
        userInterfaceStyle: "dark",
        newArchEnabled: true,

        // ── OTA (expo-updates, self-hosted en Cloudflare) ──────────────────
        // runtimeVersion = version de la app: un update JS solo cae en un APK
        // con la MISMA version. Cuando cambie algo NATIVO (permisos, módulos,
        // subir de SDK), subí `version` y recompilá el APK.
        runtimeVersion: { policy: "appVersion" },
        updates: {
            enabled: true,
            // Update-on-launch NATIVO: el runtime, durante el splash, chequea y
            // descarga el update y lanza el bundle nuevo SOLO (sin reloadAsync de
            // JS, que se trababa en MIUI). Espera hasta fallbackToCacheTimeout ms;
            // si no llega a tiempo, abre con el bundle actual y aplica al próximo
            // arranque. Nunca se cuelga. El "estado de carga" es el splash (BX).
            checkAutomatically: "ON_LOAD",
            fallbackToCacheTimeout: 10000,
            // URL del Worker de Cloudflare (endpoint /manifest). Se inyecta por
            // env al compilar; el placeholder es solo para dev. NO es secreto.
            url: process.env.EXPO_PUBLIC_OTA_URL || "https://REEMPLAZAR.workers.dev/manifest",
            // Firma de código: el APK embebe el certificado PÚBLICO y RECHAZA
            // cualquier update cuyo manifiesto no venga firmado con la clave
            // privada (que vive solo en la PC, como el keystore). Ver ota/README.
            codeSigningCertificate: "./ota/codesigning/certs/certificate.pem",
            codeSigningMetadata: { keyid: "main", alg: "rsa-v1_5-sha256" },
        },

        splash: {
            image: "./assets/splash-icon.png",
            resizeMode: "contain",
            backgroundColor: "#2D2154"
        },

        ios: {
            supportsTablet: true,
            bundleIdentifier: "com.burxia.app",
            infoPlist: {
                ITSAppUsesNonExemptEncryption: false,
                NSCameraUsageDescription:
                    "Burxia usa la cámara para la verificación de identidad (KYC) y para adjuntar comprobantes.",
                NSMicrophoneUsageDescription:
                    "Burxia usa el micrófono durante la verificación de identidad por video.",
                NSPhotoLibraryUsageDescription:
                    "Burxia accede a tus fotos para adjuntar comprobantes de pago."
            }
        },
        android: {
            adaptiveIcon: {
                foregroundImage: "./assets/adaptive-icon.png",
                backgroundColor: "#2D2154"
            },
            // CAMERA + RECORD_AUDIO: verificación biométrica (KYC ZapSign).
            // POST_NOTIFICATIONS: notificaciones push (OneSignal, Android 13+).
            permissions: ["CAMERA", "RECORD_AUDIO", "POST_NOTIFICATIONS"],
            package: "com.burxia.app",
             versionCode: 10
        },

        web: {
            favicon: "./assets/favicon.png"
        },

        plugins: [
            [
                "expo-build-properties",
                {
                    android: {
                        minSdkVersion: 26,
                        newArchEnabled: true
                    },
                    ios: {
                        deploymentTarget: "15.1"
                    }
                }
            ],
            "expo-secure-store",
            [
                "expo-image-picker",
                {
                    photosPermission:
                        "Burxia accede a tus fotos para adjuntar comprobantes de pago."
                }
            ],
            [
                "onesignal-expo-plugin",
                {
                    mode: process.env.NODE_ENV === "production" ? "production" : "development"
                }
            ]
        ],

        extra: {
            eas: {
                projectId: "08eda603-2863-4758-8210-5180b3267a4f"
            },
            // Variables de entorno de forma segura
            supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
            supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
            oneSignalAppId: process.env.EXPO_PUBLIC_ONESIGNAL_APP_ID,
            // El KYC de ZapSign pasa por la Edge Function zapsign-proxy: la API
            // key vive en el servidor, no en el binario. Acá NO va ninguna
            // clave de ZapSign (todo lo EXPO_PUBLIC_ queda dentro del APK).
            EXPO_PUBLIC_APP_ENV: process.env.EXPO_PUBLIC_APP_ENV || 'test'
        }
    }
};
