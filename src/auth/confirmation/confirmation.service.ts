import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { randomBytes } from 'crypto';
import * as moment from 'moment';
import { BaseService } from 'src/common/base.service';
import { LoggerService } from 'src/logger/logger.service';
import { Repository } from 'typeorm';
import { ConfirmationInputDTO } from '../dto/confirmation-input.dto';
import { Confirmation, ConfirmationType } from './confirmation.entity';

@Injectable()
export class ConfirmationService extends BaseService<
	Confirmation,
	Repository<Confirmation>
> {
	constructor(
		@InjectRepository(Confirmation) repository: Repository<Confirmation>,
		logger: LoggerService,
		private readonly configService: ConfigService,
	) {
		super(repository, logger);
	}

	async createConfirmationCode(payload: ConfirmationInputDTO): Promise<string> {
		const confirmation = plainToClass(Confirmation, {
			...payload,
			expiredAt: moment()
				.add(this.configService.get<number>('confirmation.ttl'), 's')
				.toDate(),
			code: randomBytes(16).toString('hex'),
			type: ConfirmationType.emailConfirm,
		});
		await this.create(confirmation);
		return confirmation.code;
	}

	async createForgetPasswordCode(
		payload: ConfirmationInputDTO,
	): Promise<string> {
		const confirmation = plainToClass(Confirmation, {
			...payload,
			expiredAt: moment()
				.add(this.configService.get<number>('confirmation.ttl'), 's')
				.toDate(),
			code: randomBytes(16).toString('hex'),
			type: ConfirmationType.forgetPassword,
		});
		await this.create(confirmation);
		return confirmation.code;
	}

	async createResetPasswordCode(
		payload: ConfirmationInputDTO,
	): Promise<string> {
		const resetPasswordCode = plainToClass(Confirmation, {
			...payload,
			expiredAt: moment()
				.add(this.configService.get<number>('confirmation.ttl'), 's')
				.toDate(),
			code: randomBytes(16).toString('hex'),
			type: ConfirmationType.resetPassword,
		});
		await this.create(resetPasswordCode);
		return resetPasswordCode.code;
	}
}
