/**
 * Transaction Mapper
 * Maps between TransactionModel (DTO) and TransactionEntity (Domain)
 */
import { TransactionEntity, TransactionType, TransactionStatus } from '../../domain/entities/Transaction.entity';

export interface TransactionModel {
    id: string;
    account_id: string;
    type: TransactionType;
    amount: number;
    description: string;
    status: TransactionStatus;
    recipient_cvu?: string | null;
    recipient_alias?: string | null;
    recipient_name?: string | null;
    created_at: string;
    completed_at?: string | null;
    metadata?: Record<string, any> | null;
}

export class TransactionMapper {
    static toDomain(model: TransactionModel): TransactionEntity {
        return new TransactionEntity(
            model.id,
            model.account_id,
            model.type,
            model.amount,
            model.description,
            model.status,
            model.recipient_cvu || null,
            model.recipient_alias || null,
            model.recipient_name || null,
            new Date(model.created_at),
            model.completed_at ? new Date(model.completed_at) : null,
            model.metadata || null
        );
    }

    static toDomainArray(models: TransactionModel[]): TransactionEntity[] {
        return models.map((model) => this.toDomain(model));
    }
}
