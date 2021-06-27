import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AbstractService } from 'src/common/abstract.service';
import { LoggerService } from 'src/logger/logger.service';
import { User, UserDocument } from './user.schema';

@Injectable()
export class UserService extends AbstractService<UserDocument> {
	constructor(
		@InjectModel(User.name) private userModel: Model<UserDocument>,
		logger: LoggerService,
	) {
		super(logger, userModel);
	}

	async findByPhoneNumber(phoneNumber: string): Promise<User> {
		return await this.userModel.findOne({ phoneNumber });
	}
}
