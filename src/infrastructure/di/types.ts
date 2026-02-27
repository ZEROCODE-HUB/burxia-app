/**
 * Dependency Injection Types
 * Symbols for all injectable services and repositories
 */
export const TYPES = {
    // Repositories
    IAuthRepository: Symbol.for('IAuthRepository'),
    IAccountRepository: Symbol.for('IAccountRepository'),
    ITransactionRepository: Symbol.for('ITransactionRepository'),

    // Use Cases - Auth
    LoginUseCase: Symbol.for('LoginUseCase'),
    RegisterUseCase: Symbol.for('RegisterUseCase'),
    VerifyPinUseCase: Symbol.for('VerifyPinUseCase'),

    // Use Cases - Transactions
    TransferMoneyUseCase: Symbol.for('TransferMoneyUseCase'),
    GetTransactionHistoryUseCase: Symbol.for('GetTransactionHistoryUseCase'),

    // Use Cases - Account
    GetBalanceUseCase: Symbol.for('GetBalanceUseCase'),
    GetAccountInfoUseCase: Symbol.for('GetAccountInfoUseCase'),

    // Infrastructure Services
    EncryptionService: Symbol.for('EncryptionService'),
    BiometricService: Symbol.for('BiometricService'),
    SessionManager: Symbol.for('SessionManager'),
    SecureStorage: Symbol.for('SecureStorage'),
    Logger: Symbol.for('Logger'),
    AnalyticsService: Symbol.for('AnalyticsService'),

    // Data Sources
    SupabaseAdapter: Symbol.for('SupabaseAdapter'),
    SupabaseAuthDataSource: Symbol.for('SupabaseAuthDataSource'),
    SupabaseAccountDataSource: Symbol.for('SupabaseAccountDataSource'),
    SupabaseTransactionDataSource: Symbol.for('SupabaseTransactionDataSource'),
    SecureStorageDataSource: Symbol.for('SecureStorageDataSource'),
};
