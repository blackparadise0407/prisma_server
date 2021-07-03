import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateUserDTO {
	@IsNotEmpty({ message: 'Username is required' })
	@ApiProperty()
	readonly username?: string;

	@IsNotEmpty({ message: 'Password is required' })
	@ApiProperty()
	readonly password?: string;

	@IsNotEmpty({ message: 'Email is required' })
	@IsEmail({}, { message: 'Invalid email address' })
	@ApiProperty()
	readonly email?: string;

	@ApiProperty()
	readonly googleId?: string;

	@ApiProperty()
	readonly facebookId?: string;
}
