/**
 * Account Mapper
 * Maps between AccountModel (DTO) and AccountEntity (Domain)
 */
import { AccountEntity, AccountType } from '../../domain/entities/Account.entity';

export interface AccountModel {
    id: string;
    user_id: string;
    account_type_id: string;
    cbu: string;
    cvu: string;
    alias: string;
    balance: number;
    status: 'active' | 'inactive' | 'blocked';
    is_primary: boolean;
    created_at: string;
    updated_at: string;
    account_type?: {
        id: string;
        name: string;
        code: string;
        description: string;
    };
}

export class AccountMapper {
    static toDomain(model: AccountModel): AccountEntity {
        let accountType: AccountType | undefined;

        if (model.account_type) {
            accountType = {
                id: model.account_type.id,
                name: model.account_type.name,
                code: model.account_type.code,
                description: model.account_type.description,
            };
        }

        return new AccountEntity(
            model.id,
            model.user_id,
            model.account_type_id,
            model.cbu,
            model.cvu,
            model.alias,
            model.balance,
            model.status,
            model.is_primary,
            new Date(model.created_at),
            new Date(model.updated_at),
            accountType
        );
    }

    static toDomainArray(models: AccountModel[]): AccountEntity[] {
        return models.map((model) => this.toDomain(model));
    }
}
