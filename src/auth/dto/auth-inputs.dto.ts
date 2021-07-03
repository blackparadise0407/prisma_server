import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsEmail, IsNotEmpty } from 'class-validator';

export class RegisterInputDTO {
	@IsDefined()
	@IsNotEmpty()
	readonly username: string;

	@IsDefined()
	@IsNotEmpty()
	@IsEmail({}, { message: 'Invalid email address' })
	@ApiProperty()
	readonly email: string;

	@IsDefined()
	@IsNotEmpty()
	readonly password: string;
}
