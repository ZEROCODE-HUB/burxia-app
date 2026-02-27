/**
 * Authentication Repository Interface
 * Defines contract for authentication operations
 */
import { Result } from '../Result';
import { UserEntity } from '../entities/User.entity';
import { Email } from '../value-objects/Email.vo';
import { PIN } from '../value-objects/PIN.vo';

export interface LoginCredentials {
    email: Email;
    pin: PIN;
}

export interface RegisterData {
    email: Email;
    pin: PIN;
    firstName: string;
    lastName: string;
    phone: string;
    dni: string;
    cuitCuil: string;
}

export interface IAuthRepository {
    /**
     * Authenticate user with email and PIN
     */
    login(credentials: LoginCredentials): Promise<Result<UserEntity>>;

    /**
     * Register a new user
     */
    register(data: RegisterData): Promise<Result<UserEntity>>;

    /**
     * Verify PIN for sensitive operations
     */
    verifyPin(userId: string, pin: PIN): Promise<Result<boolean>>;

    /**
     * Logout current user
     */
    logout(): Promise<Result<void>>;

    /**
     * Get current authenticated user
     */
    getCurrentUser(): Promise<Result<UserEntity | null>>;

    /**
     * Check if user is authenticated
     */
    isAuthenticated(): Promise<boolean>;
}
