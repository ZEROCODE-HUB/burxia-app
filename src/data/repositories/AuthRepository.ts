/**
 * Auth Repository Implementation
 * Implements IAuthRepository using Supabase
 */
import { injectable, inject } from 'inversify';
import 'reflect-metadata';
import { Result } from '../../domain/Result';
import { UserEntity } from '../../domain/entities/User.entity';
import { Email } from '../../domain/value-objects/Email.vo';
import { PIN } from '../../domain/value-objects/PIN.vo';
import {
    IAuthRepository,
    LoginCredentials,
    RegisterData,
} from '../../domain/repositories/IAuthRepository';
import { SupabaseAdapter } from '../datasources/remote/adapters/SupabaseAdapter';
import { UserMapper, UserModel } from '../mappers/UserMapper';
import { EncryptionService } from '../../infrastructure/security/EncryptionService';
import { TYPES } from '../../infrastructure/di/types';

@injectable()
export class AuthRepository implements IAuthRepository {
    constructor(
        @inject(TYPES.SupabaseAdapter) private supabase: SupabaseAdapter,
        @inject(TYPES.EncryptionService) private encryption: EncryptionService
    ) { }

    async login(credentials: LoginCredentials): Promise<Result<UserEntity>> {
        try {
            const email = credentials.email.getValue();
            const pin = credentials.pin.getValue();

            // Hash PIN
            const pinHash = await this.encryption.hashPin(pin);

            // Get user by email
            const userResult = await this.supabase.query<UserModel>('users', {
                filter: { email },
                single: true,
            });

            if (userResult.isFailure) {
                return Result.fail<UserEntity>('Usuario no encontrado');
            }

            const userModel = userResult.getValue();

            // Verify PIN (stored in encrypted_credentials)
            const client = this.supabase.getClient();
            const { data: userCredentials, error } = await client
                .from('user_credentials')
                .select('pin_hash')
                .eq('user_id', userModel.id)
                .single();

            if (error || !userCredentials) {
                return Result.fail<UserEntity>('Credenciales inválidas');
            }

            const isValidPin = await this.encryption.verifyPin(pin, userCredentials.pin_hash);
            if (!isValidPin) {
                return Result.fail<UserEntity>('PIN incorrecto');
            }

            // Sign in with Supabase Auth
            const randomPassword = this.encryption.generateRandomPassword();
            const { error: signInError } = await client.auth.signInWithPassword({
                email,
                password: randomPassword,
            });

            if (signInError) {
                return Result.fail<UserEntity>('Error al iniciar sesión');
            }

            const user = UserMapper.toDomain(userModel);
            return Result.ok<UserEntity>(user);
        } catch (error: any) {
            return Result.fail<UserEntity>(error.message || 'Error al iniciar sesión');
        }
    }

    async register(data: RegisterData): Promise<Result<UserEntity>> {
        try {
            const email = data.email.getValue();
            const pin = data.pin.getValue();

            // Generate random password for Supabase auth
            const autoPassword = this.encryption.generateRandomPassword();

            // Hash PIN
            const pinHash = await this.encryption.hashPin(pin);

            // Create user in Supabase Auth
            const client = this.supabase.getClient();
            const { data: authData, error: authError } = await client.auth.signUp({
                email,
                password: autoPassword,
                options: {
                    data: {
                        first_name: data.firstName,
                        last_name: data.lastName,
                        phone: data.phone,
                        dni: data.dni,
                        cuit_cuil: data.cuitCuil,
                    },
                },
            });

            if (authError || !authData.user) {
                return Result.fail<UserEntity>(authError?.message || 'Error al crear usuario');
            }

            // Save encrypted credentials
            const { error: credError } = await client
                .from('user_credentials')
                .insert({
                    user_id: authData.user.id,
                    pin_hash: pinHash,
                    encrypted_password: autoPassword,
                });

            if (credError) {
                // Rollback: delete auth user
                await client.auth.admin.deleteUser(authData.user.id);
                return Result.fail<UserEntity>('Error al guardar credenciales');
            }

            // Get created user
            const userResult = await this.supabase.query<UserModel>('users', {
                filter: { id: authData.user.id },
                single: true,
            });

            if (userResult.isFailure) {
                return Result.fail<UserEntity>('Error al obtener usuario creado');
            }

            const user = UserMapper.toDomain(userResult.getValue());
            return Result.ok<UserEntity>(user);
        } catch (error: any) {
            return Result.fail<UserEntity>(error.message || 'Error al registrar usuario');
        }
    }

    async verifyPin(userId: string, pin: PIN): Promise<Result<boolean>> {
        try {
            const client = this.supabase.getClient();
            const { data: credentials, error } = await client
                .from('user_credentials')
                .select('pin_hash')
                .eq('user_id', userId)
                .single();

            if (error || !credentials) {
                return Result.fail<boolean>('Credenciales no encontradas');
            }

            const isValid = await this.encryption.verifyPin(
                pin.getValue(),
                credentials.pin_hash
            );

            return Result.ok<boolean>(isValid);
        } catch (error: any) {
            return Result.fail<boolean>(error.message || 'Error al verificar PIN');
        }
    }

    async logout(): Promise<Result<void>> {
        try {
            const client = this.supabase.getClient();
            const { error } = await client.auth.signOut();

            if (error) {
                return Result.fail<void>(error.message);
            }

            return Result.ok<void>();
        } catch (error: any) {
            return Result.fail<void>(error.message || 'Error al cerrar sesión');
        }
    }

    async getCurrentUser(): Promise<Result<UserEntity | null>> {
        try {
            const client = this.supabase.getClient();
            const { data: { user } } = await client.auth.getUser();

            if (!user) {
                return Result.ok<UserEntity | null>(null);
            }

            const userResult = await this.supabase.query<UserModel>('users', {
                filter: { id: user.id },
                single: true,
            });

            if (userResult.isFailure) {
                return Result.ok<UserEntity | null>(null);
            }

            const userEntity = UserMapper.toDomain(userResult.getValue());
            return Result.ok<UserEntity | null>(userEntity);
        } catch (error: any) {
            return Result.fail<UserEntity | null>(error.message || 'Error al obtener usuario');
        }
    }

    async isAuthenticated(): Promise<boolean> {
        try {
            const client = this.supabase.getClient();
            const { data: { session } } = await client.auth.getSession();
            return !!session;
        } catch {
            return false;
        }
    }
}
