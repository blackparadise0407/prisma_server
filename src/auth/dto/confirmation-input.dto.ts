import { IsNotEmpty } from 'class-validator';
import { ConfirmationType } from '../confirmation/confirmation.interface';

export class ConfirmationInputDTO {
	@IsNotEmpty({ message: 'User ID is required' })
	readonly userId?: string;

	@IsNotEmpty({ message: 'Code is required' })
	code?: string;

	@IsNotEmpty({ message: 'Expire at is required' })
	expiredAt?: Date;

	@IsNotEmpty({ message: 'Type is required' })
	type?: ConfirmationType;
}
