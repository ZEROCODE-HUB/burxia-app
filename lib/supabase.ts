import 'react-native-url-polyfill/auto';
import { AppState, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';
import { getEnvVar } from '../utils/env';

const supabaseUrl = getEnvVar('EXPO_PUBLIC_SUPABASE_URL');
const supabaseAnonKey = getEnvVar('EXPO_PUBLIC_SUPABASE_ANON_KEY');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  throw new Error('Faltan las variables de entorno de Supabase en .env');
}

// Lock en memoria (serializa el refresh del token). Con `persistSession: true`
// en WEB, supabase-js usa por defecto el `navigatorLock` (LockManager del
// navegador), que se deadlockeaba: si un refresh queda tomado y no libera,
// TODAS las requests siguientes esperan para siempre y la app queda "Cargando"
// a los pocos minutos, hasta recargar. Este lock nunca deadlockea.
let refreshChain: Promise<unknown> = Promise.resolve();

// Timeout DURO por operación dentro del lock. Si el `fn` (típicamente el refresh
// de token) queda colgado y no resuelve NI rechaza, sin esto la cadena
// `refreshChain` se traba para siempre y TODAS las consultas siguientes esperan
// eternamente → la app queda "Cargando..." a los pocos minutos (aunque la red
// esté bien). Con esto la cadena SIEMPRE avanza a los 20s como mucho.
const LOCK_OP_TIMEOUT_MS = 20000;
function withTimeout<R>(p: Promise<R>, ms: number): Promise<R> {
  return new Promise<R>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('supabase lock op timeout')), ms);
    p.then(
      (v) => { clearTimeout(t); resolve(v); },
      (e) => { clearTimeout(t); reject(e); },
    );
  });
}
function memoryLock<R>(_name: string, _timeout: number, fn: () => Promise<R>): Promise<R> {
  const run = refreshChain.then(
    () => withTimeout(fn(), LOCK_OP_TIMEOUT_MS),
    () => withTimeout(fn(), LOCK_OP_TIMEOUT_MS),
  );
  // La cadena avanza SIEMPRE (resuelva o rechace, y aun por timeout), así una
  // operación colgada nunca bloquea a las siguientes de forma permanente.
  refreshChain = run.then(() => undefined, () => undefined);
  return run;
}

// Timeout global para TODA request (auth incluida). Si una request se cuelga
// (típico del refresh de token que quedaba tomando el lock), aborta a los 30s,
// el lock se libera y la app se AUTO-RECUPERA, en vez de quedar "Cargando" para
// siempre hasta recargar. Se respeta el signal del que llama, si trae uno.
const REQUEST_TIMEOUT_MS = 30000;
const fetchWithTimeout: typeof fetch = (input, init) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const external = init?.signal;
  if (external) {
    if (external.aborted) controller.abort();
    else external.addEventListener('abort', () => controller.abort(), { once: true });
  }
  return fetch(input as any, { ...init, signal: controller.signal }).finally(() => clearTimeout(timer));
};

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  global: { fetch: fetchWithTimeout },
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    lock: memoryLock,
    // Se persiste la sesión: si estaba en false, la sesión vivía solo en
    // memoria y CUALQUIER recarga (o el Fast Refresh del dev server en web)
    // la borraba, obligando a re-loguear a los pocos minutos. En web,
    // AsyncStorage usa localStorage; en nativo, el almacenamiento del device.
    persistSession: true,
    // En nativo hay que arrancar el auto-refresh según el foreground (abajo);
    // en web el cliente ya maneja el ticker solo.
    detectSessionInUrl: false,
  },
});

// Patrón oficial de Supabase para React Native: refrescar el token solo
// mientras la app está en foreground. Sin esto, el auto-refresh no se re-arma
// tras estar en background y las requests empiezan a fallar.
if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
}
