import { BadRequestException, Injectable } from '@nestjs/common';
import { AbstractService } from 'src/common/abstract.service';
import { MailService } from 'src/mail/mail.service';
import { UserService } from 'src/user/user.service';
import { RegisterInputDTO } from './dto/auth-inputs.dto';

@Injectable()
export class AuthService extends AbstractService<any> {
	constructor(
		private readonly userService: UserService,
		private readonly mailService: MailService,
	) {
		super();
	}

	// async createOTP(): Promise<>;
}
