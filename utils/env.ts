import Constants from "expo-constants";

// Función para obtener variables de entorno de manera segura
export const getEnvVar = (key: string): string => {
  // Primero intenta desde process.env (web/desarrollo)
  if (process.env[key]) {
    return process.env[key] as string;
  }

  // Luego intenta desde expo-constants (nativo)
  if (Constants.expoConfig?.extra?.[key]) {
    return Constants.expoConfig.extra[key];
  }

  // Valores por defecto hardcodeados como último recurso
  const defaults: Record<string, string> = {
    EXPO_PUBLIC_SUPABASE_URL: "https://mzxhyjgbbabnughknrxc.supabase.co",
    EXPO_PUBLIC_SUPABASE_ANON_KEY:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16eGh5amdiYmFibnVnaGtucnhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0OTk1NzYsImV4cCI6MjA4NDA3NTU3Nn0.OMPAyQoQbiZKbmN7USAbDk7C4w-glidP1p3Izt_LkRY",
  };

  return defaults[key] || "";
};
