/**
 * Account Repository Interface
 * Defines contract for account operations
 */
import { Result } from '../Result';
import { AccountEntity } from '../entities/Account.entity';
import { Money } from '../value-objects/Money.vo';

export interface IAccountRepository {
    /**
     * Get account by ID
     */
    getById(accountId: string): Promise<Result<AccountEntity>>;

    /**
     * Get primary account for user
     */
    getPrimaryAccount(userId: string): Promise<Result<AccountEntity>>;

    /**
     * Get all accounts for user
     */
    getUserAccounts(userId: string): Promise<Result<AccountEntity[]>>;

    /**
     * Get account by CVU
     */
    getByCvu(cvu: string): Promise<Result<AccountEntity>>;

    /**
     * Get account by alias
     */
    getByAlias(alias: string): Promise<Result<AccountEntity>>;

    /**
     * Update account balance
     */
    updateBalance(accountId: string, newBalance: Money): Promise<Result<void>>;

    /**
     * Block account
     */
    blockAccount(accountId: string): Promise<Result<void>>;

    /**
     * Unblock account
     */
    unblockAccount(accountId: string): Promise<Result<void>>;
}
