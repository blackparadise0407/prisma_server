import { Injectable } from '@nestjs/common';
import { AbstractService } from 'src/common/abstract.service';
import { MailService } from 'src/mail/mail.service';
import { UserService } from 'src/user/user.service';

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
