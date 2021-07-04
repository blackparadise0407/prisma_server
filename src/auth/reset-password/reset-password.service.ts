import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { randomBytes } from 'crypto';
import * as moment from 'moment';
import { Model, Types } from 'mongoose';
import { AbstractService } from 'src/common/abstract.service';
import { ResetPassword, ResetPasswordDocument } from './reset-password.schema';

@Injectable()
export class ResetPasswordService extends AbstractService<ResetPasswordDocument> {
	constructor(
		@InjectModel(ResetPassword.name)
		resetPasswordModel: Model<ResetPasswordDocument>,
		private readonly configService: ConfigService,
	) {
		super(resetPasswordModel);
	}

	async createResetCode(userId: string): Promise<string> {
		const payload: ResetPassword = {};
		payload.expiredAt = moment()
			.add(this.configService.get<number>('reset_password.ttl'), 's')
			.toDate();
		payload.code = randomBytes(16).toString('hex');
		payload.userId = Types.ObjectId(userId);
		const doc = await this.create(payload);
		return doc.code;
	}
}
