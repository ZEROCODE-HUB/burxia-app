/**
 * Money Value Object
 * Ensures monetary amounts are always valid with proper precision
 */
import { Result } from '../Result';

export class Money {
    private readonly amount: number;
    private readonly currency: string;

    private constructor(amount: number, currency: string = 'ARS') {
        this.amount = amount;
        this.currency = currency;
    }

    public getAmount(): number {
        return this.amount;
    }

    public getCurrency(): string {
        return this.currency;
    }

    public static create(amount: number, currency: string = 'ARS'): Result<Money> {
        if (amount === null || amount === undefined) {
            return Result.fail<Money>('El monto no puede estar vacío');
        }

        if (amount < 0) {
            return Result.fail<Money>('El monto no puede ser negativo');
        }

        // Validate precision (max 2 decimal places for currency)
        const decimalPlaces = (amount.toString().split('.')[1] || '').length;
        if (decimalPlaces > 2) {
            return Result.fail<Money>('El monto no puede tener más de 2 decimales');
        }

        // Round to 2 decimal places to avoid floating point issues
        const roundedAmount = Math.round(amount * 100) / 100;

        return Result.ok<Money>(new Money(roundedAmount, currency));
    }

    public add(other: Money): Result<Money> {
        if (this.currency !== other.currency) {
            return Result.fail<Money>('No se pueden sumar montos de diferentes monedas');
        }

        return Money.create(this.amount + other.amount, this.currency);
    }

    public subtract(other: Money): Result<Money> {
        if (this.currency !== other.currency) {
            return Result.fail<Money>('No se pueden restar montos de diferentes monedas');
        }

        return Money.create(this.amount - other.amount, this.currency);
    }

    public isGreaterThan(other: Money): boolean {
        if (this.currency !== other.currency) {
            throw new Error('Cannot compare different currencies');
        }
        return this.amount > other.amount;
    }

    public isLessThan(other: Money): boolean {
        if (this.currency !== other.currency) {
            throw new Error('Cannot compare different currencies');
        }
        return this.amount < other.amount;
    }

    public equals(other: Money): boolean {
        return this.amount === other.amount && this.currency === other.currency;
    }

    public toString(): string {
        return `${this.currency} ${this.amount.toFixed(2)}`;
    }
}
