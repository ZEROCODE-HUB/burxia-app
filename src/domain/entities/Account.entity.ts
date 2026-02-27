/**
 * Account Entity
 * Represents a bank account with balance and limits
 */
import { Money } from '../value-objects/Money.vo';
import { Result } from '../Result';

export interface AccountType {
    id: string;
    name: string;
    code: string;
    description: string;
}

export interface Account {
    id: string;
    userId: string;
    accountTypeId: string;
    cbu: string;
    cvu: string;
    alias: string;
    balance: number;
    status: 'active' | 'inactive' | 'blocked';
    isPrimary: boolean;
    createdAt: Date;
    updatedAt: Date;
    accountType?: AccountType;
}

export class AccountEntity implements Account {
    constructor(
        public readonly id: string,
        public readonly userId: string,
        public readonly accountTypeId: string,
        public readonly cbu: string,
        public readonly cvu: string,
        public readonly alias: string,
        public readonly balance: number,
        public readonly status: 'active' | 'inactive' | 'blocked',
        public readonly isPrimary: boolean,
        public readonly createdAt: Date,
        public readonly updatedAt: Date,
        public readonly accountType?: AccountType
    ) { }

    public getBalance(): Result<Money> {
        return Money.create(this.balance);
    }

    public isActive(): boolean {
        return this.status === 'active';
    }

    public canTransact(): boolean {
        return this.isActive() && !this.isBlocked();
    }

    public isBlocked(): boolean {
        return this.status === 'blocked';
    }

    public canDebit(amount: Money): Result<boolean> {
        const balanceResult = this.getBalance();
        if (balanceResult.isFailure) {
            return Result.fail(balanceResult.error!);
        }

        const balance = balanceResult.getValue();

        if (!this.canTransact()) {
            return Result.fail('La cuenta no está activa para transacciones');
        }

        if (balance.isLessThan(amount)) {
            return Result.fail('Saldo insuficiente');
        }

        return Result.ok(true);
    }

    public getFormattedCVU(): string {
        // Format CVU as: XXXX XXXX XXXX XXXX XXXX XX
        return this.cvu.match(/.{1,4}/g)?.join(' ') || this.cvu;
    }

    public getFormattedCBU(): string {
        // Format CBU as: XXXX XXXX XXXX XXXX XXXX XX
        return this.cbu.match(/.{1,4}/g)?.join(' ') || this.cbu;
    }
}
