/**
 * Transaction Repository Implementation
 * Implements ITransactionRepository using Supabase
 */
import { injectable, inject } from 'inversify';
import 'reflect-metadata';
import { Result } from '../../domain/Result';
import { TransactionEntity } from '../../domain/entities/Transaction.entity';
import { Money } from '../../domain/value-objects/Money.vo';
import {
    ITransactionRepository,
    CreateTransactionData,
} from '../../domain/repositories/ITransactionRepository';
import { SupabaseAdapter } from '../datasources/remote/adapters/SupabaseAdapter';
import { TransactionMapper, TransactionModel } from '../mappers/TransactionMapper';
import { TYPES } from '../../infrastructure/di/types';

@injectable()
export class TransactionRepository implements ITransactionRepository {
    constructor(
        @inject(TYPES.SupabaseAdapter) private supabase: SupabaseAdapter
    ) { }

    async create(data: CreateTransactionData): Promise<Result<TransactionEntity>> {
        try {
            const client = this.supabase.getClient();
            const { data: transaction, error } = await client
                .from('transactions')
                .insert({
                    account_id: data.accountId,
                    type: data.type,
                    amount: data.amount.getAmount(),
                    description: data.description,
                    status: 'pending',
                    recipient_cvu: data.recipientCvu,
                    recipient_alias: data.recipientAlias,
                    recipient_name: data.recipientName,
                    metadata: data.metadata,
                })
                .select()
                .single();

            if (error || !transaction) {
                return Result.fail<TransactionEntity>(error?.message || 'Error al crear transacción');
            }

            const entity = TransactionMapper.toDomain(transaction);
            return Result.ok<TransactionEntity>(entity);
        } catch (error: any) {
            return Result.fail<TransactionEntity>(error.message || 'Error al crear transacción');
        }
    }

    async getById(transactionId: string): Promise<Result<TransactionEntity>> {
        try {
            const result = await this.supabase.query<TransactionModel>('transactions', {
                filter: { id: transactionId },
                single: true,
            });

            if (result.isFailure) {
                return Result.fail<TransactionEntity>('Transacción no encontrada');
            }

            const transaction = TransactionMapper.toDomain(result.getValue());
            return Result.ok<TransactionEntity>(transaction);
        } catch (error: any) {
            return Result.fail<TransactionEntity>(error.message || 'Error al obtener transacción');
        }
    }

    async getByAccount(
        accountId: string,
        limit: number = 50,
        offset: number = 0
    ): Promise<Result<TransactionEntity[]>> {
        try {
            const client = this.supabase.getClient();
            const { data, error } = await client
                .from('transactions')
                .select('*')
                .eq('account_id', accountId)
                .order('created_at', { ascending: false })
                .range(offset, offset + limit - 1);

            if (error) {
                return Result.fail<TransactionEntity[]>(error.message);
            }

            const transactions = TransactionMapper.toDomainArray(data || []);
            return Result.ok<TransactionEntity[]>(transactions);
        } catch (error: any) {
            return Result.fail<TransactionEntity[]>(error.message || 'Error al obtener transacciones');
        }
    }

    async getRecent(accountId: string, limit: number = 10): Promise<Result<TransactionEntity[]>> {
        return this.getByAccount(accountId, limit, 0);
    }

    async updateStatus(transactionId: string, status: any): Promise<Result<void>> {
        try {
            const client = this.supabase.getClient();
            const { error } = await client
                .from('transactions')
                .update({
                    status,
                    completed_at: status === 'completed' ? new Date().toISOString() : null,
                })
                .eq('id', transactionId);

            if (error) {
                return Result.fail<void>(error.message);
            }

            return Result.ok<void>();
        } catch (error: any) {
            return Result.fail<void>(error.message || 'Error al actualizar estado');
        }
    }

    async getByDateRange(
        accountId: string,
        startDate: Date,
        endDate: Date
    ): Promise<Result<TransactionEntity[]>> {
        try {
            const client = this.supabase.getClient();
            const { data, error } = await client
                .from('transactions')
                .select('*')
                .eq('account_id', accountId)
                .gte('created_at', startDate.toISOString())
                .lte('created_at', endDate.toISOString())
                .order('created_at', { ascending: false });

            if (error) {
                return Result.fail<TransactionEntity[]>(error.message);
            }

            const transactions = TransactionMapper.toDomainArray(data || []);
            return Result.ok<TransactionEntity[]>(transactions);
        } catch (error: any) {
            return Result.fail<TransactionEntity[]>(error.message || 'Error al obtener transacciones');
        }
    }

    async getTotalSpent(accountId: string, startDate: Date, endDate: Date): Promise<Result<Money>> {
        try {
            const transactionsResult = await this.getByDateRange(accountId, startDate, endDate);

            if (transactionsResult.isFailure) {
                return Result.fail<Money>(transactionsResult.error!);
            }

            const transactions = transactionsResult.getValue();
            const total = transactions
                .filter((t) => t.isDebit() && t.isCompleted())
                .reduce((sum, t) => sum + t.amount, 0);

            return Money.create(total);
        } catch (error: any) {
            return Result.fail<Money>(error.message || 'Error al calcular total gastado');
        }
    }
}
