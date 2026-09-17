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
        // slug + owner + projectId (extra.eas) deben apuntar al proyecto EAS REAL
        // ("Burxia", 0ac05162..., cuenta "nocodehero"), donde viven las credenciales
        // de iOS (ASC API key + cert + provisioning). Es la config con la que
        // Andrés logró el build exitoso.
        slug: "Burxia",
        owner: "nocodehero",
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
            url: process.env.EXPO_PUBLIC_OTA_URL || "https://burxia-ota.oscarmijael7w7.workers.dev/manifest",
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
                projectId: "0ac05162-1c51-4217-9c25-9dfd3a8087fa"
            },
            // Fallbacks PÚBLICOS: en builds de CI (EAS) no hay .env, así que sin
            // esto el binario saldría sin config (no conecta a Supabase). Son
            // valores públicos (el anon key va embebido en cualquier APK, protegido
            // por RLS). En dev local, .env (process.env) tiene prioridad.
            supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL || "https://spieokzbbwmgkcdigsxo.supabase.co",
            supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwaWVva3piYndtZ2tjZGlnc3hvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUwMTQwMjIsImV4cCI6MjEwMDU5MDAyMn0._fJJdOgvkiaC3pqSmq_Pc4AEahNx18kH9VA7Og_18m0",
            oneSignalAppId: process.env.EXPO_PUBLIC_ONESIGNAL_APP_ID || "60292b2a-10ce-4172-acc8-1ff41c598590",
            // El KYC de ZapSign pasa por la Edge Function zapsign-proxy: la API
            // key vive en el servidor, no en el binario. Acá NO va ninguna
            // clave de ZapSign (todo lo EXPO_PUBLIC_ queda dentro del APK).
            EXPO_PUBLIC_APP_ENV: process.env.EXPO_PUBLIC_APP_ENV || 'test'
        }
    }
};
