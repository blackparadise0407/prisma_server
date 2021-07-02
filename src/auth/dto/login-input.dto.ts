import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginInputDTO {
	@IsNotEmpty({ message: 'Phone number is required' })
	// @IsPhone({}, { message: 'Invalid phone number' })
	@ApiProperty()
	readonly phoneNumber: string;

	@IsNotEmpty({ message: 'Password is required' })
	@ApiProperty()
	readonly password: string;
}
