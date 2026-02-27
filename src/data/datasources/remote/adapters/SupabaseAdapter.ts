/**
 * Supabase Adapter
 * Wraps Supabase client and normalizes responses
 */
import { SupabaseClient } from '@supabase/supabase-js';
import { Result } from '../../../../domain/Result';

export class SupabaseAdapter {
    constructor(private client: SupabaseClient) { }

    async query<T>(
        table: string,
        options?: {
            select?: string;
            filter?: Record<string, any>;
            single?: boolean;
            order?: { column: string; ascending?: boolean };
            limit?: number;
        }
    ): Promise<Result<T>> {
        try {
            let query = this.client.from(table).select(options?.select || '*');

            // Apply filters
            if (options?.filter) {
                Object.entries(options.filter).forEach(([key, value]) => {
                    query = query.eq(key, value);
                });
            }

            // Apply ordering
            if (options?.order) {
                query = query.order(options.order.column, {
                    ascending: options.order.ascending ?? true,
                });
            }

            // Apply limit
            if (options?.limit) {
                query = query.limit(options.limit);
            }

            // Execute query
            const { data, error } = options?.single
                ? await query.single()
                : await query;

            if (error) {
                return Result.fail<T>(this.normalizeError(error));
            }

            return Result.ok<T>(data as T);
        } catch (error: any) {
            return Result.fail<T>(this.normalizeError(error));
        }
    }

    async insert<T>(table: string, data: any): Promise<Result<T>> {
        try {
            const { data: result, error } = await this.client
                .from(table)
                .insert(data)
                .select()
                .single();

            if (error) {
                return Result.fail<T>(this.normalizeError(error));
            }

            return Result.ok<T>(result as T);
        } catch (error: any) {
            return Result.fail<T>(this.normalizeError(error));
        }
    }

    async update<T>(
        table: string,
        id: string,
        data: any
    ): Promise<Result<T>> {
        try {
            const { data: result, error } = await this.client
                .from(table)
                .update(data)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                return Result.fail<T>(this.normalizeError(error));
            }

            return Result.ok<T>(result as T);
        } catch (error: any) {
            return Result.fail<T>(this.normalizeError(error));
        }
    }

    private normalizeError(error: any): string {
        if (typeof error === 'string') {
            return error;
        }

        if (error?.message) {
            return error.message;
        }

        return 'Ha ocurrido un error inesperado';
    }

    getClient(): SupabaseClient {
        return this.client;
    }
}
