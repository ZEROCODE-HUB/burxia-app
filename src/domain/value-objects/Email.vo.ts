/**
 * Email Value Object
 * Ensures email is always valid and normalized
 */
import { Result } from '../Result';

export class Email {
    private readonly value: string;

    private constructor(email: string) {
        this.value = email;
    }

    public getValue(): string {
        return this.value;
    }

    public static create(email: string): Result<Email> {
        if (!email || email.trim().length === 0) {
            return Result.fail<Email>('El email no puede estar vacío');
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(normalizedEmail)) {
            return Result.fail<Email>('El formato del email no es válido');
        }

        return Result.ok<Email>(new Email(normalizedEmail));
    }

    public equals(other: Email): boolean {
        return this.value === other.value;
    }
}
