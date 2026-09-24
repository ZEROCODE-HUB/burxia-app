// contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Platform } from 'react-native';
import { supabase } from '../lib/supabase';
import { User, Account, AccountWithType } from '../types/database.types';
import { loginWithPin as loginService } from '../services/auth.service';
import { saveLastUser } from '../services/storage.service';
import { oneSignalService } from '../services/oneSignalService';

interface AuthContextType {
  user: User | null;
  account: AccountWithType | null;
  session: any;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, pin: string) => Promise<{ success: boolean; error?: string; requireDeviceVerification?: boolean }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  refreshAccount: () => Promise<void>;
  pendingDeviceVerification: boolean;
  setPendingDeviceVerification: (val: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [account, setAccount] = useState<AccountWithType | null>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pendingDeviceVerification, setPendingDeviceVerification] = useState(false);

  const isAuthenticated = !!session && !!user && !pendingDeviceVerification;

  useEffect(() => {
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 Auth event:', event);
        setSession(session);

        if (event === 'SIGNED_IN' && session) {
          await loadUserData(session.user.id);
          // ✅ Vincular con OneSignal después del login
          await oneSignalService.loginUser(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setAccount(null);
          // ✅ Desvincular de OneSignal al hacer logout
          await oneSignalService.logoutUser();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const checkSession = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);

      if (session?.user) {
        const email = session.user.email || '';
        // La verificación de dispositivo solo corre si está activada desde el
        // backoffice (RPC device_verification_requerida: global o por usuario).
        // En web se omite (sin módulos nativos; rebotaba al login en cada
        // recarga). Apagada por defecto (el OTP hoy no se entrega sin SMTP).
        let known = true;
        if (Platform.OS !== 'web') {
          const { data: mustVerify } = await supabase.rpc('device_verification_requerida' as any);
          if (mustVerify === true) {
            const { isDeviceKnown } = await import('../services/auth.service');
            known = await isDeviceKnown(session.user.id, email);
          }
        }

        if (!known) {
          const { sendVerificationOtp } = await import('../services/auth.service');
          await sendVerificationOtp();
          setPendingDeviceVerification(true);
        }

        await loadUserData(session.user.id);
        // ✅ Vincular con OneSignal si ya existe sesión activa y dispositivo conocido
        if (known) await oneSignalService.loginUser(session.user.id);
      }
    } catch (error) {
      console.error('Error checking session:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserData = async (userId: string) => {
    try {
      // Retry logic for fetching user profile (handles race condition with Trigger)
      let userData: User | null = null;
      let attempts = 0;
      const maxAttempts = 5; // Increased attempts

      while (attempts < maxAttempts && !userData) {
        attempts++;
        try {
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

          if (error) {
            // Only retry on specific errors like "Row not found" (PGRST116)
            if (error.code === 'PGRST116') {
              if (attempts < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, 1500)); // Wait longer
                continue;
              }
            }
            throw error;
          }
          userData = data as unknown as User;
        } catch (innerError: any) {
          // Handle network errors or other non-supabase errors if needed
          if (innerError.code === 'PGRST116') {
            if (attempts < maxAttempts) {
              await new Promise(resolve => setTimeout(resolve, 1500));
              continue;
            }
          }
          throw innerError;
        }
      }

      // En Bruxia las columnas son document_number / tax_id; la app
      // heredada lee user.dni / user.cuit_cuil en ~28 lugares. Se normaliza
      // acá, en el único punto donde se arma el user, en vez de tocar cada
      // pantalla. Se conservan ambos nombres para no romper nada.
      if (userData) {
        const u = userData as any;
        userData = {
          ...u,
          dni: u.dni ?? u.document_number ?? "",
          cuit_cuil: u.cuit_cuil ?? u.tax_id ?? "",
        };
      }

      setUser(userData);

      // Save for "Remember Me"
      if (userData) {
        saveLastUser({
          email: (userData as any).email,
          firstName: (userData as any).first_name,
          lastName: (userData as any).last_name,
          avatarUrl: (userData as any).photo_url
        }).catch(() => { });
      }

      const { data: accountData, error: accountError } = await supabase
        .from('accounts')
        .select('*, account_types(*)')
        .eq('user_id', userId)
        .eq('is_primary', true)
        .single();

      if (accountError) throw accountError;
      setAccount(accountData as AccountWithType);

    } catch (error: any) {
      // If user not found (PGRST116) force logout AFTER retries failed
      if (error.code === 'PGRST116') {
        // Fallback: Construct user from session metadata if available
        const currentSession = await supabase.auth.getSession();
        const authUser = currentSession.data.session?.user;

        if (authUser && authUser.id === userId) {
          const metadata = authUser.user_metadata || {};
          const fallbackUser: User = {
            id: authUser.id,
            email: authUser.email || '',
            first_name: metadata.nombres || 'Usuario',
            last_name: metadata.apellidos || '',
            phone: metadata.telefono || '',
            dni: metadata.dni || '',
            cuit_cuil: metadata.cuit || '',
            pin_hash: metadata.pin_hash || '',
            verification_status: 'pending', // Fail-closed: sin perfil no se asume verificado (gate KYB)
            web_access_enabled: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            // Initialize optional fields to null to satisfy User type
            web_password_hash: null,
            web_access_enabled_at: null,
            zapsign_verification_id: null,
            zapsign_verified_at: null,
            zapsign_data: null,
            photo_url: metadata.avatar_url || null
          };
          setUser(fallbackUser);

          // Attempt to fetch account even if user profile failed
          try {
            const { data: accountData, error: accountError } = await supabase
              .from('accounts')
              .select('*, account_types(*)')
              .eq('user_id', userId)
              .eq('is_primary', true)
              .single();

            if (!accountError && accountData) {
              setAccount(accountData as AccountWithType);
            } else {
              setAccount(null); // Ensure account is null if not found
            }
          } catch (accErr) {
            setAccount(null); // Ensure account is null on error
          }

        } else {
          setUser(null);
          setAccount(null); // Also clear account if user fallback fails
        }
      } else {
        // Error TRANSITORIO (red, re-emisión de SIGNED_IN al enfocar, refresh de
        // token, etc.): NO borrar user/account en memoria. Borrarlos rompía toda
        // la app ("Cargando…" para siempre) hasta recargar. La sesión solo se
        // limpia en un SIGNED_OUT real (ver onAuthStateChange).
        console.error('Error loading user data (se conserva la sesión):', error);
      }
    }
  };

  const login = async (email: string, pin: string) => {
    try {
      const result = await loginService(email, pin);

      if (result.success) {
        if (result.requireDeviceVerification) {
          setPendingDeviceVerification(true);
          return { success: true, requireDeviceVerification: true };
        } else {
          setPendingDeviceVerification(false);
          return { success: true, requireDeviceVerification: false };
        }
      } else {
        return { success: false, error: result.error };
      }
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      setLoading(true);

      // ✅ Desvincular de OneSignal antes de hacer logout
      await oneSignalService.logoutUser();

      await supabase.auth.signOut();
      setUser(null);
      setAccount(null);
      setSession(null);
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    if (!session?.user?.id) return;
    await loadUserData(session.user.id);
  };

  // Refresco LIVIANO y NO destructivo de la cuenta (saldo/límites). Se llama al
  // enfocar pantallas: solo re-baja la fila de la cuenta y la actualiza si sale
  // bien. NUNCA borra user/account ante un error transitorio (eso rompía la app).
  const refreshAccount = async () => {
    const uid = session?.user?.id;
    if (!uid) return;
    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('*, account_types(*)')
        .eq('user_id', uid)
        .eq('is_primary', true)
        .single();
      if (!error && data) setAccount(data as AccountWithType);
    } catch {
      /* mantener la cuenta actual; un fallo de refresco no debe romper la sesión */
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        account,
        session,
        loading,
        isAuthenticated,
        login,
        logout,
        refreshUser,
        refreshAccount,
        pendingDeviceVerification,
        setPendingDeviceVerification,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};