import { MailerService } from '@nestjs-modules/mailer';
import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bull';
import { AppModule } from 'src/app.module';
import { User } from 'src/user/schema/user.schema';

@Injectable()
export class MailService {
	constructor(
		private mailerService: MailerService,
		private configService: ConfigService,
		@InjectQueue('mailQueue') private mailQueue: Queue,
	) {}
	async sendUserConfirmation(user: User, code: string): Promise<boolean> {
		try {
			await this.mailQueue.add('userConfirmation', {
				user,
				code,
			});
			return true;
		} catch (e) {
			return false;
		}
		// const url = AppModule.isDev
		// 	? this.configService.get('host') + '/api/auth/confirmation?code=' + code
		// 	: `${this.configService.get('host')}:${this.configService.get('post')}` +
		// 	  '/api/auth/confirmation?code=' +
		// 	  code;
		// await this.mailerService.sendMail({
		// 	to: user.email,
		// 	subject: 'Welcome to Prisma! Confirm your Email',
		// 	template: './confirmation',
		// 	context: {
		// 		url,
		// 		name: user.username,
		// 	},
		// });
	}

	async sendUserForgetPassword(user: User, code: string) {
		const url = AppModule.isDev
			? this.configService.get('host') + '/api/auth/reset?code=' + code
			: `${this.configService.get('host')}:${this.configService.get('post')}` +
			  '/api/auth/reset?code=' +
			  code;

		await this.mailerService.sendMail({
			to: user.email,
			subject: 'Reset password',
			template: './forget-password',
			context: {
				url,
				name: user.username,
			},
		});
	}
}
