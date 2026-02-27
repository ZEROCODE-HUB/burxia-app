/**
 * Transfer Money Use Case
 * Handles money transfer business logic with validation
 */
import { injectable, inject } from 'inversify';
import { Result } from '../../Result';
import { TransactionEntity } from '../../entities/Transaction.entity';
import { Money } from '../../value-objects/Money.vo';
import { IAccountRepository } from '../../repositories/IAccountRepository';
import { ITransactionRepository } from '../../repositories/ITransactionRepository';
import { TYPES } from '../../../infrastructure/di/types';

export interface TransferInput {
    fromAccountId: string;
    recipientCvu: string;
    amount: number;
    description: string;
}

@injectable()
export class TransferMoneyUseCase {
    constructor(
        @inject(TYPES.IAccountRepository) private accountRepository: IAccountRepository,
        @inject(TYPES.ITransactionRepository) private transactionRepository: ITransactionRepository
    ) { }

    async execute(input: TransferInput): Promise<Result<TransactionEntity>> {
        // Validate amount
        const amountResult = Money.create(input.amount);
        if (amountResult.isFailure) {
            return Result.fail<TransactionEntity>(amountResult.error!);
        }

        const amount = amountResult.getValue();

        // Validate minimum amount
        const minAmount = Money.create(1).getValue();
        if (amount.isLessThan(minAmount)) {
            return Result.fail<TransactionEntity>('El monto mínimo es $1.00');
        }

        // Get source account
        const sourceAccountResult = await this.accountRepository.getById(input.fromAccountId);
        if (sourceAccountResult.isFailure) {
            return Result.fail<TransactionEntity>('Cuenta de origen no encontrada');
        }

        const sourceAccount = sourceAccountResult.getValue();

        // Check if account can transact
        if (!sourceAccount.canTransact()) {
            return Result.fail<TransactionEntity>('La cuenta no está activa para transacciones');
        }

        // Check if account has sufficient balance
        const canDebitResult = sourceAccount.canDebit(amount);
        if (canDebitResult.isFailure) {
            return Result.fail<TransactionEntity>(canDebitResult.error!);
        }

        // Validate recipient CVU
        if (!input.recipientCvu || input.recipientCvu.trim().length !== 22) {
            return Result.fail<TransactionEntity>('CVU del destinatario inválido');
        }

        // Check recipient account exists
        const recipientAccountResult = await this.accountRepository.getByCvu(input.recipientCvu);
        if (recipientAccountResult.isFailure) {
            return Result.fail<TransactionEntity>('Cuenta de destinatario no encontrada');
        }

        const recipientAccount = recipientAccountResult.getValue();

        // Cannot transfer to same account
        if (sourceAccount.id === recipientAccount.id) {
            return Result.fail<TransactionEntity>('No puedes transferir a tu propia cuenta');
        }

        // Create outgoing transaction
        const transactionResult = await this.transactionRepository.create({
            accountId: sourceAccount.id,
            type: 'transfer_out',
            amount: amount,
            description: input.description || 'Transferencia',
            recipientCvu: recipientAccount.cvu,
            recipientAlias: recipientAccount.alias,
            metadata: {
                recipientAccountId: recipientAccount.id,
            },
        });

        if (transactionResult.isFailure) {
            return Result.fail<TransactionEntity>(transactionResult.error!);
        }

        const transaction = transactionResult.getValue();

        // Update source account balance
        const newSourceBalance = sourceAccount.getBalance().getValue().subtract(amount);
        if (newSourceBalance.isFailure) {
            // Rollback transaction
            await this.transactionRepository.updateStatus(transaction.id, 'failed');
            return Result.fail<TransactionEntity>('Error al actualizar saldo');
        }

        await this.accountRepository.updateBalance(sourceAccount.id, newSourceBalance.getValue());

        // Update recipient account balance
        const newRecipientBalance = recipientAccount.getBalance().getValue().add(amount);
        if (newRecipientBalance.isFailure) {
            // Rollback
            await this.transactionRepository.updateStatus(transaction.id, 'failed');
            await this.accountRepository.updateBalance(sourceAccount.id, sourceAccount.getBalance().getValue());
            return Result.fail<TransactionEntity>('Error al actualizar saldo del destinatario');
        }

        await this.accountRepository.updateBalance(recipientAccount.id, newRecipientBalance.getValue());

        // Create incoming transaction for recipient
        await this.transactionRepository.create({
            accountId: recipientAccount.id,
            type: 'transfer_in',
            amount: amount,
            description: input.description || 'Transferencia recibida',
            recipientCvu: sourceAccount.cvu,
            recipientAlias: sourceAccount.alias,
            metadata: {
                sourceAccountId: sourceAccount.id,
                relatedTransactionId: transaction.id,
            },
        });

        // Mark transaction as completed
        await this.transactionRepository.updateStatus(transaction.id, 'completed');

        return Result.ok<TransactionEntity>(transaction);
    }
}
