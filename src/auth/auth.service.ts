import { BadRequestException, Injectable } from '@nestjs/common';
import { AbstractService } from 'src/common/abstract.service';
import { LoggerService } from 'src/logger/logger.service';
import { UserService } from 'src/user/user.service';
import { RegisterInputDTO } from './dto/auth-inputs.dto';

@Injectable()
export class AuthService extends AbstractService<any> {
	constructor(private userService: UserService, logger: LoggerService) {
		super(logger);
	}

	async register(payload: RegisterInputDTO): Promise<any> {
		const existedUser = await this.userService.findByPhoneNumber(
			payload.phoneNumber,
		);
		if (existedUser) {
			throw new BadRequestException('Phone number already in use');
		}
	}
}
