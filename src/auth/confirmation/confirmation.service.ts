import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { randomBytes } from 'crypto';
import * as moment from 'moment';
import { Model } from 'mongoose';
import { CachingService } from 'src/caching/caching.service';
import { AbstractService } from 'src/common/abstract.service';
import { ConfirmationInputDTO } from '../dto/confirmation-input.dto';
import { Confirmation, ConfirmationDocument } from './confirmation.schema';

@Injectable()
export class ConfirmationService extends AbstractService<ConfirmationDocument> {
	constructor(
		@InjectModel(Confirmation.name)
		confirmationModel: Model<ConfirmationDocument>,
		private readonly configService: ConfigService,
		private readonly cachingService: CachingService,
	) {
		super(confirmationModel);
	}

	// async createConfirmationCode(payload: ConfirmationInputDTO): Promise<string> {
	// 	payload.expiredAt = moment()
	// 		.add(this.configService.get<number>('confirmation.ttl'), 's')
	// 		.toDate();
	// 	payload.code = randomBytes(16).toString('hex');
	// 	payload.type = 'CONFIRMATION';
	// 	const confirmation = await this.create(payload);
	// 	return confirmation.code;
	// }

	async createConfirmationCode(userId: string): Promise<string> {
		// payload.expiredAt = moment()
		// 	.add(, 's')
		// 	.toDate();
		const ttl = this.configService.get<number>('confirmation.ttl');
		const code = randomBytes(16).toString('hex');
		const payload: ConfirmationInputDTO = {
			type: 'CONFIRMATION',
			userId,
		};
		await this.cachingService.set(code, payload, { ttl });
		return code;
	}

	async createResetPasswordCode(
		payload: ConfirmationInputDTO,
	): Promise<string> {
		payload.expiredAt = moment()
			.add(this.configService.get<number>('confirmation.ttl'), 's')
			.toDate();
		payload.code = randomBytes(16).toString('hex');
		payload.type = 'FORGET_PASSWORD';
		const confirmation = await this.create(payload);
		return confirmation.code;
	}
}
