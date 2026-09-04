import { transactionService } from './transaction.service';
import {
    buildStatementHtml,
    sumMovements,
    GenerateStatementParams,
    StatementResult,
    StatementFilters,
} from './statement.template';

export type { StatementFilters, GenerateStatementParams, StatementResult };

export const statementService = {
    /**
     * Estado de cuenta en WEB: `expo-print`/`expo-sharing` no existen en el
     * navegador. Abrimos el HTML del estado en una ventana nueva y disparamos
     * la impresión del navegador, desde donde el usuario puede "Guardar como PDF".
     */
    async generateAndShare(params: GenerateStatementParams): Promise<StatementResult> {
        const { accountId, accountHolderName, balance, filters } = params;

        const movements = await transactionService.getAccountMovements(accountId, 2000, 0, filters);
        const html = buildStatementHtml({ accountHolderName, balance, movements, filters });

        const win = window.open('', '_blank');
        if (!win) {
            throw new Error('El navegador bloqueó la ventana. Permití las ventanas emergentes para descargar el estado de cuenta.');
        }
        win.document.open();
        win.document.write(html);
        win.document.close();
        win.focus();
        // Pequeña espera para que renderice antes de imprimir.
        setTimeout(() => {
            try {
                win.print();
            } catch {
                // Si falla la impresión automática, la ventana queda abierta para
                // que el usuario imprima manualmente.
            }
        }, 400);

        const { income, expense } = sumMovements(movements);
        return { count: movements.length, income, expense };
    },
};
