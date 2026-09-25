import React, { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { VerificacionPendienteModal } from '../components/VerificacionPendienteModal';

/**
 * Portón SUAVE para pantallas funcionales. El usuario que envió el KYB (cuenta
 * en verificación) puede ENTRAR y explorar la pantalla; al intentar EJECUTAR la
 * operación se llama a `requireVerificado()`: si no está verificado, abre el
 * modal de aviso y devuelve false (la acción se cancela); si sí, devuelve true.
 *
 * Uso:
 *   const { requireVerificado, modal } = useVerificacionGate();
 *   const onAccion = () => { if (!requireVerificado()) return; ...operar... };
 *   return (<>...{modal}</>);
 */
export function useVerificacionGate() {
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);
  const verificado = (user as any)?.verification_status === 'verified';

  const requireVerificado = useCallback(() => {
    if (verificado) return true;
    setVisible(true);
    return false;
  }, [verificado]);

  const modal = (
    <VerificacionPendienteModal visible={visible} onClose={() => setVisible(false)} />
  );

  return { verificado, requireVerificado, modal };
}
