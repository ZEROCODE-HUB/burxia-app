import { useCallback, useRef } from 'react';
import { useFocusEffect } from 'expo-router';
import { useAuth } from '../context/AuthContext';

/**
 * Refresca la cuenta (saldo, límites) del AuthContext cada vez que la pantalla
 * gana foco, para que tras una operación (retiro, depósito, OTC, transferencia)
 * el saldo se actualice solo — sin recargar. Es NO destructivo: si el refresco
 * falla, mantiene la cuenta actual (nunca rompe la sesión).
 */
export function useAccountRefreshOnFocus() {
  const { refreshAccount } = useAuth();
  const ref = useRef(refreshAccount);
  ref.current = refreshAccount;
  useFocusEffect(
    useCallback(() => {
      ref.current?.().catch?.(() => {});
    }, [])
  );
}
