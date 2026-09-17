import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Voucher } from './Voucher';
import { buildOtcVoucher } from './voucher.builders';
import type { OtcOrder } from '../services/otc.service';

// Compatibilidad: la pantalla OTC sigue usando <OperationVoucher order=...>. Ahora
// delega en el comprobante ÚNICO (Voucher) vía el builder de OTC, para que se vea
// idéntico al de Inicio/Movimientos.
export function OperationVoucher({ order, visible, onClose }: { order: OtcOrder | null; visible: boolean; onClose: () => void }) {
  const { user } = useAuth();
  return (
    <Voucher
      model={order ? buildOtcVoucher(order, user) : null}
      visible={visible}
      onClose={onClose}
    />
  );
}
