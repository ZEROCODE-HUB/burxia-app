/**
 * PIN Value Object
 * Ensures PIN is always 6 digits
 */
import { Result } from '../Result';

export class PIN {
    private readonly value: string;

    private constructor(pin: string) {
        this.value = pin;
    }

    public getValue(): string {
        return this.value;
    }

    public static create(pin: string): Result<PIN> {
        if (!pin || pin.trim().length === 0) {
            return Result.fail<PIN>('El PIN no puede estar vacío');
        }

        const cleanPin = pin.trim();

        // Must be exactly 6 digits
        if (!/^\d{6}$/.test(cleanPin)) {
            return Result.fail<PIN>('El PIN debe tener exactamente 6 dígitos');
        }

        // Validate not all same digits (e.g., 111111)
        if (/^(\d)\1{5}$/.test(cleanPin)) {
            return Result.fail<PIN>('El PIN no puede tener todos los dígitos iguales');
        }

        // Validate not sequential (e.g., 123456)
        const isSequential = this.isSequentialDigits(cleanPin);
        if (isSequential) {
            return Result.fail<PIN>('El PIN no puede ser una secuencia consecutiva');
        }

        return Result.ok<PIN>(new PIN(cleanPin));
    }

    private static isSequentialDigits(pin: string): boolean {
        const digits = pin.split('').map(Number);

        // Check ascending sequence
        let isAscending = true;
        for (let i = 1; i < digits.length; i++) {
            if (digits[i] !== digits[i - 1] + 1) {
                isAscending = false;
                break;
            }
        }

        // Check descending sequence
        let isDescending = true;
        for (let i = 1; i < digits.length; i++) {
            if (digits[i] !== digits[i - 1] - 1) {
                isDescending = false;
                break;
            }
        }

        return isAscending || isDescending;
    }

    public equals(other: PIN): boolean {
        return this.value === other.value;
    }
}
