/**
 * Transaction Entity
 * Represents a financial transaction
 */
import { Money } from '../value-objects/Money.vo';
import { Result } from '../Result';

export type TransactionType = 'transfer_out' | 'transfer_in' | 'deposit' | 'withdrawal' | 'payment';
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled';

export interface Transaction {
    id: string;
    accountId: string;
    type: TransactionType;
    amount: number;
    description: string;
    status: TransactionStatus;
    recipientCvu?: string | null;
    recipientAlias?: string | null;
    recipientName?: string | null;
    createdAt: Date;
    completedAt?: Date | null;
    metadata?: Record<string, any> | null;
}

export class TransactionEntity implements Transaction {
    constructor(
        public readonly id: string,
        public readonly accountId: string,
        public readonly type: TransactionType,
        public readonly amount: number,
        public readonly description: string,
        public readonly status: TransactionStatus,
        public readonly recipientCvu: string | null = null,
        public readonly recipientAlias: string | null = null,
        public readonly recipientName: string | null = null,
        public readonly createdAt: Date = new Date(),
        public readonly completedAt: Date | null = null,
        public readonly metadata: Record<string, any> | null = null
    ) { }

    public getAmount(): Result<Money> {
        return Money.create(this.amount);
    }

    public isCompleted(): boolean {
        return this.status === 'completed';
    }

    public isPending(): boolean {
        return this.status === 'pending';
    }

    public isFailed(): boolean {
        return this.status === 'failed';
    }

    public isDebit(): boolean {
        return this.type === 'transfer_out' || this.type === 'withdrawal' || this.type === 'payment';
    }

    public isCredit(): boolean {
        return this.type === 'transfer_in' || this.type === 'deposit';
    }

    public getFormattedAmount(): string {
        const amountResult = this.getAmount();
        if (amountResult.isFailure) {
            return '$0.00';
        }

        const money = amountResult.getValue();
        const sign = this.isDebit() ? '-' : '+';
        return `${sign} ${money.toString()}`;
    }

    public getRecipientDisplay(): string {
        if (this.recipientName) {
            return this.recipientName;
        }
        if (this.recipientAlias) {
            return this.recipientAlias;
        }
        if (this.recipientCvu) {
            return this.recipientCvu;
        }
        return 'Desconocido';
    }
}
