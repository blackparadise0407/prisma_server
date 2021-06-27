import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AbstractService } from 'src/common/abstract.service';
import { LoggerService } from 'src/logger/logger.service';
import {
	RefreshToken,
	RefreshTokenDocument,
} from 'src/refresh-token/refresh-token.schema';

@Injectable()
export class TokenService extends AbstractService<RefreshTokenDocument> {
	constructor(
		@InjectModel(RefreshToken.name)
		refreshTokenModel: Model<RefreshTokenDocument>,
		logger: LoggerService,
	) {
		super(logger, refreshTokenModel);
	}
	// Commit
}
