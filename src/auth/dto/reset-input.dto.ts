import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ResetPasswordDTO {
	@IsEmail({}, { message: 'Invalid email address' })
	@ApiProperty()
	readonly email?: string;
}

export class CreateNewPasswordDTO {
	@IsNotEmpty({ message: 'Reset code is required' })
	@ApiProperty()
	readonly code?: string;

	@IsNotEmpty({ message: 'Password is required' })
	@ApiProperty()
	readonly password?: string;

	@IsNotEmpty({ message: 'Confirm password is required' })
	@ApiProperty()
	readonly confirm_password?: string;
}
