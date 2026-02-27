/**
 * Account Repository Implementation
 * Implements IAccountRepository using Supabase
 */
import { injectable, inject } from 'inversify';
import 'reflect-metadata';
import { Result } from '../../domain/Result';
import { AccountEntity } from '../../domain/entities/Account.entity';
import { Money } from '../../domain/value-objects/Money.vo';
import { IAccountRepository } from '../../domain/repositories/IAccountRepository';
import { SupabaseAdapter } from '../datasources/remote/adapters/SupabaseAdapter';
import { AccountMapper, AccountModel } from '../mappers/AccountMapper';
import { TYPES } from '../../infrastructure/di/types';

@injectable()
export class AccountRepository implements IAccountRepository {
    constructor(
        @inject(TYPES.SupabaseAdapter) private supabase: SupabaseAdapter
    ) { }

    async getById(accountId: string): Promise<Result<AccountEntity>> {
        try {
            const result = await this.supabase.query<AccountModel>('accounts', {
                select: '*, account_type:account_types(*)',
                filter: { id: accountId },
                single: true,
            });

            if (result.isFailure) {
                return Result.fail<AccountEntity>('Cuenta no encontrada');
            }

            const account = AccountMapper.toDomain(result.getValue());
            return Result.ok<AccountEntity>(account);
        } catch (error: any) {
            return Result.fail<AccountEntity>(error.message || 'Error al obtener cuenta');
        }
    }

    async getPrimaryAccount(userId: string): Promise<Result<AccountEntity>> {
        try {
            const result = await this.supabase.query<AccountModel>('accounts', {
                select: '*, account_type:account_types(*)',
                filter: { user_id: userId, is_primary: true },
                single: true,
            });

            if (result.isFailure) {
                return Result.fail<AccountEntity>('Cuenta principal no encontrada');
            }

            const account = AccountMapper.toDomain(result.getValue());
            return Result.ok<AccountEntity>(account);
        } catch (error: any) {
            return Result.fail<AccountEntity>(error.message || 'Error al obtener cuenta principal');
        }
    }

    async getUserAccounts(userId: string): Promise<Result<AccountEntity[]>> {
        try {
            const result = await this.supabase.query<AccountModel[]>('accounts', {
                select: '*, account_type:account_types(*)',
                filter: { user_id: userId },
                order: { column: 'is_primary', ascending: false },
            });

            if (result.isFailure) {
                return Result.fail<AccountEntity[]>('Error al obtener cuentas');
            }

            const accounts = AccountMapper.toDomainArray(result.getValue());
            return Result.ok<AccountEntity[]>(accounts);
        } catch (error: any) {
            return Result.fail<AccountEntity[]>(error.message || 'Error al obtener cuentas');
        }
    }

    async getByCvu(cvu: string): Promise<Result<AccountEntity>> {
        try {
            const result = await this.supabase.query<AccountModel>('accounts', {
                select: '*, account_type:account_types(*)',
                filter: { cvu },
                single: true,
            });

            if (result.isFailure) {
                return Result.fail<AccountEntity>('Cuenta no encontrada');
            }

            const account = AccountMapper.toDomain(result.getValue());
            return Result.ok<AccountEntity>(account);
        } catch (error: any) {
            return Result.fail<AccountEntity>(error.message || 'Error al buscar cuenta');
        }
    }

    async getByAlias(alias: string): Promise<Result<AccountEntity>> {
        try {
            const result = await this.supabase.query<AccountModel>('accounts', {
                select: '*, account_type:account_types(*)',
                filter: { alias },
                single: true,
            });

            if (result.isFailure) {
                return Result.fail<AccountEntity>('Cuenta no encontrada');
            }

            const account = AccountMapper.toDomain(result.getValue());
            return Result.ok<AccountEntity>(account);
        } catch (error: any) {
            return Result.fail<AccountEntity>(error.message || 'Error al buscar cuenta');
        }
    }

    async updateBalance(accountId: string, newBalance: Money): Promise<Result<void>> {
        try {
            const client = this.supabase.getClient();
            const { error } = await client
                .from('accounts')
                .update({ balance: newBalance.getAmount() })
                .eq('id', accountId);

            if (error) {
                return Result.fail<void>(error.message);
            }

            return Result.ok<void>();
        } catch (error: any) {
            return Result.fail<void>(error.message || 'Error al actualizar saldo');
        }
    }

    async blockAccount(accountId: string): Promise<Result<void>> {
        try {
            const client = this.supabase.getClient();
            const { error } = await client
                .from('accounts')
                .update({ status: 'blocked' })
                .eq('id', accountId);

            if (error) {
                return Result.fail<void>(error.message);
            }

            return Result.ok<void>();
        } catch (error: any) {
            return Result.fail<void>(error.message || 'Error al bloquear cuenta');
        }
    }

    async unblockAccount(accountId: string): Promise<Result<void>> {
        try {
            const client = this.supabase.getClient();
            const { error } = await client
                .from('accounts')
                .update({ status: 'active' })
                .eq('id', accountId);

            if (error) {
                return Result.fail<void>(error.message);
            }

            return Result.ok<void>();
        } catch (error: any) {
            return Result.fail<void>(error.message || 'Error al desbloquear cuenta');
        }
    }
}
