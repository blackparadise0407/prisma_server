import { MailerService } from '@nestjs-modules/mailer';
import { OnQueueFailed, Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Job } from 'bull';
import { User } from 'src/user/user.entity';

@Processor('mailQueue')
export class MailProcessor {
	private readonly logger = new Logger('Bull');
	constructor(
		private readonly mailerService: MailerService,
		private readonly configService: ConfigService,
	) {}

	// @OnQueueActive()
	// onActive(job: Job) {
	// 	this.logger.debug(
	// 		`Processing job ${job.id} of type ${job.name}. Data: ${JSON.stringify(
	// 			job.data,
	// 		)}`,
	// 	);
	// }

	// @OnQueueCompleted()
	// onComplete(job: Job, result: any) {
	// 	this.logger.debug(
	// 		`Completed job ${job.id} of type ${job.name}. Result: ${JSON.stringify(
	// 			result,
	// 		)}`,
	// 	);
	// }

	@OnQueueFailed()
	onError(job: Job<any>, error: any) {
		this.logger.error(
			`Failed job ${job.id} of type ${job.name}: ${error.message}`,
			error.stack,
		);
	}

	@Process('userConfirmation')
	async sendUserConfirmation(
		job: Job<{ user: User; code: string }>,
	): Promise<any> {
		const { user, code } = job.data;
		const url =
			this.configService.get('host') + '/api/auth/confirmation?code=' + code;
		try {
			await this.mailerService.sendMail({
				to: user.email,
				subject: 'Welcome to Prisma! Confirm your Email',
				template: './confirmation',
				context: {
					url,
					name: user.username,
				},
			});
			return 'Success';
		} catch (e) {
			throw e;
		}
	}

	@Process('userForgetPassword')
	async sendUserForgetPassword(
		job: Job<{ user: User; code: string }>,
	): Promise<any> {
		const { user, code } = job.data;

		const url =
			this.configService.get('host') + '/api/auth/reset-password?code=' + code;

		try {
			await this.mailerService.sendMail({
				to: user.email,
				subject: 'Reset password',
				template: './forget-password',
				context: {
					url,
					name: user.username,
				},
			});
			return 'Success';
		} catch (e) {
			throw e;
		}
	}
}
