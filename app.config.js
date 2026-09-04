// app.config.js
export default {
    expo: {
        // NOTA DE MARCA: el nombre visible de la app vive en constants/brand.ts
        // (BRAND_NAME) para el runtime. Estos identificadores nativos (name,
        // slug, scheme, bundleIdentifier, package) los consume el build de
        // Expo/EAS y se declaran acá; si cambia la marca, actualizá ambos lados.
        name: "Bruxia",
        // NOTA DE RELEASE: el projectId de EAS (extra.eas.projectId más abajo)
        // sigue siendo el de la cuenta original. Antes del primer build bajo la
        // cuenta EAS de Bruxia hay que correr `eas init` para regenerarlo; el
        // slug se ajustará a ese proyecto. Ver docs/pendientes.md.
        slug: "bruxia-mobile",
        version: "1.0.9",
        orientation: "portrait",
        icon: "./assets/icon.png",
        scheme: "bruxia",
        userInterfaceStyle: "dark",
        newArchEnabled: true,

        splash: {
            image: "./assets/splash-icon.png",
            resizeMode: "contain",
            backgroundColor: "#0f172a"
        },

        ios: {
            supportsTablet: true,
            bundleIdentifier: "com.bruxia.app",
            infoPlist: {
                ITSAppUsesNonExemptEncryption: false
            }
        },
        android: {
            adaptiveIcon: {
                foregroundImage: "./assets/adaptive-icon.png",
                backgroundColor: "#0F172A"
            },
            permissions: ["CAMERA", "RECORD_AUDIO"],
            package: "com.bruxia.app",
             versionCode: 9 
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
