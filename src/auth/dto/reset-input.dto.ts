import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ResetPasswordDTO {
	@IsEmail({}, { message: 'Invalid email address' })
	@ApiProperty()
	readonly email?: string;
}

export class CreateNewPasswordDTO {
	@IsNotEmpty({ message: 'Email address is required' })
	@IsEmail({}, { message: 'Invalid email address' })
	@ApiProperty()
	readonly email?: string;

	@IsNotEmpty({ message: 'Password is required' })
	@ApiProperty()
	readonly password?: string;
}
