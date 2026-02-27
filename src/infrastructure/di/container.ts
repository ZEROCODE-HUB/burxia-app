/**
 * DI Container - Complete Configuration
 * Binds all dependencies for the application
 */
import { Container } from 'inversify';
import 'reflect-metadata';
import { TYPES } from './types';
import { supabase } from '../../../lib/supabase';

// Domain - Repositories
import { IAuthRepository } from '../../domain/repositories/IAuthRepository';
import { IAccountRepository } from '../../domain/repositories/IAccountRepository';
import { ITransactionRepository } from '../../domain/repositories/ITransactionRepository';

// Domain - Use Cases
import { LoginUseCase } from '../../domain/usecases/auth/LoginUseCase';
import { RegisterUseCase } from '../../domain/usecases/auth/RegisterUseCase';
import { TransferMoneyUseCase } from '../../domain/usecases/transactions/TransferMoneyUseCase';

// Data - Repository Implementations
import { AuthRepository } from '../../data/repositories/AuthRepository';
import { AccountRepository } from '../../data/repositories/AccountRepository';
import { TransactionRepository } from '../../data/repositories/TransactionRepository';

// Infrastructure - Adapters
import { SupabaseAdapter } from '../../data/datasources/remote/adapters/SupabaseAdapter';

// Infrastructure - Services
import { EncryptionService } from '../security/EncryptionService';
import { BiometricService } from '../security/BiometricService';
import { SecureStorageService } from '../storage/SecureStorageService';

// Create container
const container = new Container();

// ============================================
// INFRASTRUCTURE - Adapters & Services
// ============================================

// Supabase Adapter (singleton)
container.bind<SupabaseAdapter>(TYPES.SupabaseAdapter)
    .toDynamicValue(() => new SupabaseAdapter(supabase))
    .inSingletonScope();

// Security Services
container.bind<EncryptionService>(TYPES.EncryptionService)
    .to(EncryptionService)
    .inSingletonScope();

container.bind<BiometricService>(TYPES.BiometricService)
    .to(BiometricService)
    .inSingletonScope();

container.bind<SecureStorageService>(TYPES.SecureStorage)
    .to(SecureStorageService)
    .inSingletonScope();

// ============================================
// DATA LAYER - Repositories
// ============================================

container.bind<IAuthRepository>(TYPES.IAuthRepository)
    .to(AuthRepository)
    .inSingletonScope();

container.bind<IAccountRepository>(TYPES.IAccountRepository)
    .to(AccountRepository)
    .inSingletonScope();

container.bind<ITransactionRepository>(TYPES.ITransactionRepository)
    .to(TransactionRepository)
    .inSingletonScope();

// ============================================
// DOMAIN LAYER - Use Cases
// ============================================

// Auth Use Cases
container.bind<LoginUseCase>(TYPES.LoginUseCase).to(LoginUseCase);
container.bind<RegisterUseCase>(TYPES.RegisterUseCase).to(RegisterUseCase);

// Transaction Use Cases
container.bind<TransferMoneyUseCase>(TYPES.TransferMoneyUseCase).to(TransferMoneyUseCase);

export { container };
