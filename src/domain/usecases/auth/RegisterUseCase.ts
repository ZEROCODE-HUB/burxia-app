/**
 * Register Use Case
 * Handles user registration business logic
 */
import { injectable, inject } from 'inversify';
import { Result } from '../../Result';
import { UserEntity } from '../../entities/User.entity';
import { Email } from '../../value-objects/Email.vo';
import { PIN } from '../../value-objects/PIN.vo';
import { IAuthRepository } from '../../repositories/IAuthRepository';
import { TYPES } from '../../../infrastructure/di/types';

export interface RegisterInput {
    email: string;
    pin: string;
    firstName: string;
    lastName: string;
    phone: string;
    dni: string;
    cuitCuil: string;
}

@injectable()
export class RegisterUseCase {
    constructor(
        @inject(TYPES.IAuthRepository) private authRepository: IAuthRepository
    ) { }

    async execute(input: RegisterInput): Promise<Result<UserEntity>> {
        // Validate email
        const emailResult = Email.create(input.email);
        if (emailResult.isFailure) {
            return Result.fail<UserEntity>(emailResult.error!);
        }

        // Validate PIN
        const pinResult = PIN.create(input.pin);
        if (pinResult.isFailure) {
            return Result.fail<UserEntity>(pinResult.error!);
        }

        // Validate required fields
        if (!input.firstName || input.firstName.trim().length === 0) {
            return Result.fail<UserEntity>('El nombre es requerido');
        }

        if (!input.lastName || input.lastName.trim().length === 0) {
            return Result.fail<UserEntity>('El apellido es requerido');
        }

        if (!input.phone || input.phone.trim().length === 0) {
            return Result.fail<UserEntity>('El teléfono es requerido');
        }

        if (!input.dni || input.dni.trim().length === 0) {
            return Result.fail<UserEntity>('El DNI es requerido');
        }

        // Validate DNI format (8 digits)
        const cleanDni = input.dni.replace(/\D/g, '');
        if (cleanDni.length !== 8) {
            return Result.fail<UserEntity>('El DNI debe tener 8 dígitos');
        }

        // Perform registration
        const registerResult = await this.authRepository.register({
            email: emailResult.getValue(),
            pin: pinResult.getValue(),
            firstName: input.firstName.trim(),
            lastName: input.lastName.trim(),
            phone: input.phone.trim(),
            dni: cleanDni,
            cuitCuil: input.cuitCuil.trim(),
        });

        if (registerResult.isFailure) {
            return Result.fail<UserEntity>(registerResult.error!);
        }

        return Result.ok<UserEntity>(registerResult.getValue());
    }
}
