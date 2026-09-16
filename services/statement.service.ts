import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { transactionService } from './transaction.service';
import { getMySolicitudes } from './solicitudes.service';
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
     * Genera un estado de cuenta en PDF (con los movimientos de la cuenta)
     * y lo comparte para guardar/enviar. Implementación NATIVA (expo-print +
     * expo-sharing). En web, Metro usa `statement.service.web.ts`.
     */
    async generateAndShare(params: GenerateStatementParams): Promise<StatementResult> {
        const { accountId, accountHolderName, balance, filters } = params;

        const [movements, solicitudes] = await Promise.all([
            transactionService.getAccountMovements(accountId, 2000, 0, filters),
            getMySolicitudes().catch(() => []),
        ]);

        const html = buildStatementHtml({ accountHolderName, balance, movements, solicitudes, filters });
        const { uri } = await Print.printToFileAsync({ html });

        if (!(await Sharing.isAvailableAsync())) {
            throw new Error('No es posible compartir o guardar archivos en este dispositivo');
        }

        await Sharing.shareAsync(uri, {
            mimeType: 'application/pdf',
            dialogTitle: 'Guardar estado de cuenta',
            UTI: 'com.adobe.pdf',
        });

        const { income, expense } = sumMovements(movements);
        return { count: movements.length, income, expense };
    },
};
