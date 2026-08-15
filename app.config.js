// app.config.js
export default {
    expo: {
        name: "Magnate",
        slug: "magnate-mobile",
        version: "1.0.9",
        orientation: "portrait",
        icon: "./assets/icon.png",
        scheme: "magnate",
        userInterfaceStyle: "dark",
        newArchEnabled: true,

        splash: {
            image: "./assets/splash-icon.png",
            resizeMode: "contain",
            backgroundColor: "#0f172a"
        },

        ios: {
            supportsTablet: true,
            bundleIdentifier: "com.magnate.mobile",
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
            package: "com.magnate.mobile",
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
            // ZapSign
            // ── SANDBOX (QA) ── valores hardcodeados para que el build funcione sin configurar EAS.
            // NO usar en producción: para producción setear EXPO_PUBLIC_ZAPSIGN_*_PROD y
            // EXPO_PUBLIC_APP_ENV=production vía EAS Environment Variables.
            EXPO_PUBLIC_APP_ENV: 'test',
            EXPO_PUBLIC_ZAPSIGN_API_KEY: 'ceffd5f8-9fbd-4bc0-828e-2fb4e12f6145be16875a-a747-4f42-adff-42b84c3b172b',
            EXPO_PUBLIC_ZAPSIGN_TEMPLATE_ID: '187c0e6e-825c-4fd3-99f9-bfaacbdff1f3',
            EXPO_PUBLIC_ZAPSIGN_API_KEY_PROD: process.env.EXPO_PUBLIC_ZAPSIGN_API_KEY_PROD,
            EXPO_PUBLIC_ZAPSIGN_TEMPLATE_ID_PROD: process.env.EXPO_PUBLIC_ZAPSIGN_TEMPLATE_ID_PROD,
            EXPO_PUBLIC_ZAPSIGN_SELFIE_VALIDATION_TYPE: process.env.EXPO_PUBLIC_ZAPSIGN_SELFIE_VALIDATION_TYPE
        }
    }
};
