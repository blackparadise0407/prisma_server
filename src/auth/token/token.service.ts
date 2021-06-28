import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AbstractService } from 'src/common/abstract.service';
import { RefreshToken, RefreshTokenDocument } from '../refresh-token.schema';

@Injectable()
export class TokenService extends AbstractService<RefreshTokenDocument> {
	constructor(
		@InjectModel(RefreshToken.name)
		private refreshTokenModel: Model<RefreshTokenDocument>,
	) {
		super(refreshTokenModel);
	}
}
