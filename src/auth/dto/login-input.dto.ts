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
	readonly username?: string;

	@IsEmail({}, { message: 'Invalid email address' })
	@ApiProperty()
	email?: string;

	@ApiProperty()
	readonly avatar?: string;

	@IsNotEmpty({ message: 'Google ID is required' })
	@ApiProperty()
	readonly googleId?: string;
}
