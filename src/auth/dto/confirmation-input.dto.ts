import { IsNotEmpty } from 'class-validator';

export class ConfirmationInputDTO {
	@IsNotEmpty({ message: 'User ID is required' })
	readonly userId: string;

	@IsNotEmpty({ message: 'Code is required' })
	code?: string;

	@IsNotEmpty({ message: 'Expire at is required' })
	expiredAt?: Date;
}
