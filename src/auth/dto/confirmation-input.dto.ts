import { IsNotEmpty } from 'class-validator';
import { ConfirmationType } from '../confirmation/confirmation.entity';

export class ConfirmationInputDTO {
	@IsNotEmpty({ message: 'User ID is required' })
	readonly userId?: number;

	@IsNotEmpty({ message: 'Code is required' })
	code?: string;

	@IsNotEmpty({ message: 'Expire at is required' })
	expiredAt?: Date;

	@IsNotEmpty({ message: 'Type is required' })
	type?: ConfirmationType;
}
