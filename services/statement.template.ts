import { formatCurrency, formatBalance } from '../utils/formatters';
import { AccountMovement, TransactionStatus } from '../types/database.types';
import { BRAND_NAME } from '../constants/brand';
import { SolicitudItem } from './solicitudes.service';

/**
 * Generador de HTML del estado de cuenta — módulo NEUTRO (sin expo-print ni
 * expo-sharing), para que lo puedan reutilizar tanto `statement.service.ts`
 * (nativo, PDF con expo-print) como `statement.service.web.ts` (web, imprime en
 * el navegador). No importar acá nada específico de plataforma.
 */

export interface StatementFilters {
    startDate?: Date;
    endDate?: Date;
    type?: 'income' | 'expense';
}

export interface GenerateStatementParams {
    accountId: string;
    accountHolderName: string;
    balance: number;
    filters?: StatementFilters;
}

export interface StatementResult {
    count: number;
    income: number;
    expense: number;
}

const STATUS_LABELS: Record<TransactionStatus, string> = {
    completed: 'Completada',
    pending: 'Pendiente',
    processing: 'En proceso',
    failed: 'Fallida',
    cancelled: 'Cancelada',
    reversed: 'Reversada',
};

// Estados de las solicitudes (depósitos/retiros/OTC) tal como los ve el cliente.
const SOL_STATUS_LABELS: Record<string, string> = {
    pending: 'Procesando',
    approved: 'Aprobada',
    rejected: 'Rechazada',
    completed: 'Completada',
};

const escapeHtml = (value: string): string =>
    value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

const formatDate = (iso: string): string => {
    const date = new Date(iso);
    return `${date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    })} ${date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
};

const formatPeriod = (startDate?: Date, endDate?: Date): string => {
    if (!startDate && !endDate) return 'Historial completo';
    const fmt = (d?: Date) =>
        d
            ? d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
            : '';
    if (startDate && endDate) return `${fmt(startDate)} — ${fmt(endDate)}`;
    return fmt(startDate || endDate);
};

/** Totales de ingresos/egresos de un set de movimientos. */
export const sumMovements = (movements: AccountMovement[]): { income: number; expense: number } => {
    let income = 0;
    let expense = 0;
    movements.forEach((m) => {
        if (m.movement_type === 'income') income += m.amount;
        else if (m.movement_type === 'expense') expense += m.amount;
    });
    return { income, expense };
};

export const buildStatementHtml = (params: {
    accountHolderName: string;
    balance: number;
    movements: AccountMovement[];
    solicitudes?: SolicitudItem[];
    filters?: StatementFilters;
}): string => {
    const { accountHolderName, balance, movements, solicitudes = [], filters } = params;

    let totalIncome = 0;
    let totalExpense = 0;

    interface FilaPdf { at: string; detail: string; type: string; status: string; isIncome: boolean; amountText: string; }

    // 1) Movimientos ya liquidados (mueven saldo). Suman a los totales.
    const movRows: FilaPdf[] = movements.map((m) => {
        const isIncome = m.movement_type === 'income';
        if (isIncome) totalIncome += m.amount;
        else if (m.movement_type === 'expense') totalExpense += m.amount;
        return {
            at: m.created_at,
            detail: m.counterpart_name || m.concept || m.transaction_type_name || 'Movimiento',
            // Nombre real de la operación (Depósito, Retiro, Compra USDT, Transferencia…).
            type: m.transaction_type_name || (isIncome ? 'Ingreso' : m.movement_type === 'expense' ? 'Egreso' : 'Otro'),
            status: STATUS_LABELS[m.status] || m.status,
            isIncome,
            amountText: isIncome ? `+${formatCurrency(m.amount)}` : `-${formatCurrency(Math.abs(m.amount))}`,
        };
    });

    // 2) Solicitudes en curso o rechazadas (aún no liquidadas). NO suman a los
    //    totales, pero se listan con su estado para que el estado de cuenta
    //    refleje las mismas operaciones que ve el cliente. Se deduplican contra
    //    los movimientos (una aprobada ya aparece como movimiento).
    const movTxIds = new Set(movements.map((m) => m.transaction_id));
    const solRows: FilaPdf[] = solicitudes
        .filter((s) => (s.status === 'pending' || s.status === 'rejected'))
        .filter((s) => !(s.transactionId && movTxIds.has(s.transactionId)))
        .filter((s) => {
            if (filters?.type === 'income' && !s.isIncome) return false;
            if (filters?.type === 'expense' && s.isIncome) return false;
            if (filters?.startDate && new Date(s.createdAt) < filters.startDate) return false;
            if (filters?.endDate && new Date(s.createdAt) > filters.endDate) return false;
            return true;
        })
        .map((s) => ({
            at: s.createdAt,
            detail: s.subtitle ? `${s.title} · ${s.subtitle}` : s.title,
            type: s.title,
            status: SOL_STATUS_LABELS[s.status] || s.status,
            isIncome: s.isIncome,
            amountText: s.isIncome ? `+${formatCurrency(s.amountFiat)}` : `-${formatCurrency(s.amountFiat)}`,
        }));

    const allRows = [...movRows, ...solRows].sort((a, b) => (a.at < b.at ? 1 : -1));
    const totalFilas = allRows.length;

    const rows = allRows
        .map((r) => `
            <tr>
                <td class="date">${formatDate(r.at)}</td>
                <td>${escapeHtml(r.detail)}</td>
                <td class="type">${escapeHtml(r.type)}</td>
                <td class="status">${escapeHtml(r.status)}</td>
                <td class="amount ${r.isIncome ? 'income' : 'expense'}">${r.amountText}</td>
            </tr>`)
        .join('');

    const generatedAt = new Date().toLocaleString('es-ES', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

    const balanceLabel = totalFilas > 0 ? 'Saldo al cierre' : 'Saldo disponible';

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8" />
            <style>
                * { box-sizing: border-box; }
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                    color: #2D2154;
                    margin: 0;
                    padding: 32px;
                    font-size: 13px;
                    line-height: 1.5;
                }
                .brand {
                    color: #5A4F9D;
                    font-size: 22px;
                    font-weight: 800;
                    letter-spacing: 4px;
                    text-transform: uppercase;
                }
                .title {
                    font-size: 26px;
                    font-weight: 800;
                    color: #2D2154;
                    margin-top: 4px;
                }
                .subtitle {
                    font-size: 14px;
                    color: #64748B;
                    margin-top: 2px;
                }
                .meta {
                    margin-top: 24px;
                    padding: 16px;
                    background: #F8FAFC;
                    border-radius: 12px;
                    border: 1px solid #E2E8F0;
                    display: flex;
                    justify-content: space-between;
                }
                .meta div span { color: #64748B; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
                .meta div strong { display: block; font-size: 14px; color: #2D2154; margin-top: 2px; }
                .summary {
                    margin-top: 20px;
                    display: flex;
                    gap: 12px;
                }
                .summary-card {
                    flex: 1;
                    border-radius: 12px;
                    padding: 14px 16px;
                }
                .summary-card .label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.7; }
                .summary-card .value { font-size: 20px; font-weight: 800; margin-top: 4px; }
                .summary-income { background: #ECFDF5; color: #047857; }
                .summary-expense { background: #FEF2F2; color: #B91C1C; }
                .summary-balance { background: #F0EDFA; color: #5A4F9D; }
                h2 {
                    font-size: 15px;
                    font-weight: 700;
                    color: #2D2154;
                    margin: 28px 0 12px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                }
                th {
                    text-align: left;
                    font-size: 11px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    color: #64748B;
                    padding: 8px 10px;
                    border-bottom: 2px solid #E2E8F0;
                }
                td {
                    padding: 10px;
                    border-bottom: 1px solid #EEF2F7;
                    vertical-align: top;
                }
                td.amount { text-align: right; white-space: nowrap; font-weight: 700; }
                td.amount.income { color: #047857; }
                td.amount.expense { color: #B91C1C; }
                td.date { white-space: nowrap; color: #64748B; }
                td.type, td.status { color: #475569; }
                .footer {
                    margin-top: 28px;
                    padding-top: 16px;
                    border-top: 1px solid #E2E8F0;
                    color: #94A3B8;
                    font-size: 11px;
                    text-align: center;
                }
                .empty { text-align: center; color: #64748B; padding: 32px 0; }
            </style>
        </head>
        <body>
            <div class="brand">${BRAND_NAME}</div>
            <div class="title">Estado de cuenta</div>
            <div class="subtitle">${escapeHtml(accountHolderName)}</div>

            <div class="meta">
                <div>
                    <span>Período</span>
                    <strong>${escapeHtml(formatPeriod(filters?.startDate, filters?.endDate))}</strong>
                </div>
                <div>
                    <span>Generado</span>
                    <strong>${escapeHtml(generatedAt)}</strong>
                </div>
            </div>

            <div class="summary">
                <div class="summary-card summary-income">
                    <div class="label">Ingresos</div>
                    <div class="value">${formatCurrency(totalIncome)}</div>
                </div>
                <div class="summary-card summary-expense">
                    <div class="label">Egresos</div>
                    <div class="value">${formatCurrency(totalExpense)}</div>
                </div>
                <div class="summary-card summary-balance">
                    <div class="label">${balanceLabel}</div>
                    <div class="value">${formatBalance(balance)}</div>
                </div>
            </div>

            <h2>Movimientos (${totalFilas})</h2>

            ${totalFilas === 0
                ? '<div class="empty">No hay movimientos para el período seleccionado.</div>'
                : `
                <table>
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Detalle</th>
                            <th>Tipo</th>
                            <th>Estado</th>
                            <th style="text-align: right;">Monto</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>`
            }

            <div class="footer">
                Documento generado por ${BRAND_NAME} · ${escapeHtml(new Date().getFullYear().toString())}
            </div>
        </body>
        </html>`;
};
