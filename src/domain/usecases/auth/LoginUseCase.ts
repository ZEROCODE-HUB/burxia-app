/**
 * Login Use Case
 * Handles user authentication business logic
 */
import { injectable, inject } from 'inversify';
import { Result } from '../../Result';
import { UserEntity } from '../../entities/User.entity';
import { Email } from '../../value-objects/Email.vo';
import { PIN } from '../../value-objects/PIN.vo';
import { IAuthRepository } from '../../repositories/IAuthRepository';
import { TYPES } from '../../../infrastructure/di/types';

@injectable()
export class LoginUseCase {
    constructor(
        @inject(TYPES.IAuthRepository) private authRepository: IAuthRepository
    ) { }

    async execute(email: string, pin: string): Promise<Result<UserEntity>> {
        // Validate email
        const emailResult = Email.create(email);
        if (emailResult.isFailure) {
            return Result.fail<UserEntity>(emailResult.error!);
        }

        // Validate PIN
        const pinResult = PIN.create(pin);
        if (pinResult.isFailure) {
            return Result.fail<UserEntity>(pinResult.error!);
        }

        // Perform login
        const loginResult = await this.authRepository.login({
            email: emailResult.getValue(),
            pin: pinResult.getValue(),
        });

        if (loginResult.isFailure) {
            return Result.fail<UserEntity>(loginResult.error!);
        }

        const user = loginResult.getValue();

        // Verify user is verified
        if (!user.isVerified()) {
            return Result.fail<UserEntity>('Usuario no verificado. Por favor verifica tu cuenta.');
        }

        return Result.ok<UserEntity>(user);
    }
}
