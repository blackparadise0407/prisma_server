import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginInputDTO {
	@IsNotEmpty({ message: 'Email address is required' })
	@IsEmail({}, { message: 'Invalid email address' })
	@ApiProperty()
	readonly email: string;

	@IsNotEmpty({ message: 'Password is required' })
	@ApiProperty()
	readonly password: string;
}
export class GoogleLoginDTO {
	@ApiProperty()
	username?: string;

	@IsEmail({}, { message: 'Invalid email address' })
	@ApiProperty()
	email?: string;

	@ApiProperty()
	avatar?: string;

	@IsNotEmpty({ message: 'Google ID is required' })
	@ApiProperty()
	googleId?: string;
}
