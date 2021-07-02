import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateUserDTO {
	@IsNotEmpty({ message: 'First name is required' })
	@ApiProperty()
	readonly firstName?: string;

	@IsNotEmpty({ message: 'Last name is required' })
	@ApiProperty()
	readonly lastName?: string;

	@IsNotEmpty({ message: 'Password is required' })
	@ApiProperty()
	readonly password?: string;

	@IsNotEmpty({ message: 'Phone number is required' })
	@ApiProperty()
	readonly phoneNumber?: string;

	@ApiProperty()
	readonly googleId?: string;

	@ApiProperty()
	readonly facebookId?: string;
}
