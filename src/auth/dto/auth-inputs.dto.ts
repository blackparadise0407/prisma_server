import { IsDefined, IsNotEmpty } from 'class-validator';

export class RegisterInputDTO {
	@IsDefined()
	@IsNotEmpty()
	readonly firstName: string;

	@IsDefined()
	@IsNotEmpty()
	lastName: string;

	@IsDefined()
	@IsNotEmpty()
	phoneNumber: string;

	@IsDefined()
	@IsNotEmpty()
	password: string;
}
