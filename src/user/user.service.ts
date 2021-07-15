import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AbstractService } from 'src/common/abstract.service';
import { User, UserDocument } from './schema/user.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService extends AbstractService<UserDocument> {
	constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {
		super(userModel);
	}

	async findByPhoneNumber(phoneNumber: string): Promise<UserDocument> {
		return await this.userModel.findOne({ phoneNumber });
	}

	async comparePassword(str: string, hashed: string): Promise<boolean> {
		return await bcrypt.compare(str, hashed);
	}
}
