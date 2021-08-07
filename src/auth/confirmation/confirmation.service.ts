import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
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
		payload.expiredAt = moment()
			.add(this.configService.get<number>('confirmation.ttl'), 's')
			.toDate();
		payload.code = randomBytes(16).toString('hex');
		payload.type = ConfirmationType.emailConfirm;
		const confirmation = await this.create(payload);
		return confirmation.code;
	}

	async createResetPasswordCode(
		payload: ConfirmationInputDTO,
	): Promise<string> {
		payload.expiredAt = moment()
			.add(this.configService.get<number>('confirmation.ttl'), 's')
			.toDate();
		payload.code = randomBytes(16).toString('hex');
		payload.type = ConfirmationType.resetPassword;
		const confirmation = await this.create(payload);
		return confirmation.code;
	}
}
