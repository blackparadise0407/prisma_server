import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, Length } from 'class-validator';

export class CreateUserDTO {
	@Length(3, 20)
	@IsNotEmpty({ message: 'Username is required' })
	@ApiProperty()
	readonly username?: string;

	@Length(3, 20)
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
