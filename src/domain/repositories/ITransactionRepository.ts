/**
 * Transaction Repository Interface
 * Defines contract for transaction operations
 */
import { Result } from '../Result';
import { TransactionEntity, TransactionType, TransactionStatus } from '../entities/Transaction.entity';
import { Money } from '../value-objects/Money.vo';

export interface CreateTransactionData {
    accountId: string;
    type: TransactionType;
    amount: Money;
    description: string;
    recipientCvu?: string;
    recipientAlias?: string;
    recipientName?: string;
    metadata?: Record<string, any>;
}

export interface ITransactionRepository {
    /**
     * Create a new transaction
     */
    create(data: CreateTransactionData): Promise<Result<TransactionEntity>>;

    /**
     * Get transaction by ID
     */
    getById(transactionId: string): Promise<Result<TransactionEntity>>;

    /**
     * Get transactions for account
     */
    getByAccount(accountId: string, limit?: number, offset?: number): Promise<Result<TransactionEntity[]>>;

    /**
     * Get recent transactions for account
     */
    getRecent(accountId: string, limit?: number): Promise<Result<TransactionEntity[]>>;

    /**
     * Update transaction status
     */
    updateStatus(transactionId: string, status: TransactionStatus): Promise<Result<void>>;

    /**
     * Get transactions by date range
     */
    getByDateRange(accountId: string, startDate: Date, endDate: Date): Promise<Result<TransactionEntity[]>>;

    /**
     * Get total spent in period
     */
    getTotalSpent(accountId: string, startDate: Date, endDate: Date): Promise<Result<Money>>;
}
