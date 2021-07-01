import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { verify } from 'jsonwebtoken';
import { Model } from 'mongoose';
import { AbstractService } from 'src/common/abstract.service';
import { JwtPayload } from '../jwt-payload';
import { RefreshToken, RefreshTokenDocument } from '../refresh-token.schema';

@Injectable()
export class TokenService extends AbstractService<RefreshTokenDocument> {
	constructor(
		@InjectModel(RefreshToken.name)
		private refreshTokenModel: Model<RefreshTokenDocument>,
		private readonly configService: ConfigService,
	) {
		super(refreshTokenModel);
	}

	async validateToken(
		token: string,
		ignoreExpiration = false,
		refresh = false,
	): Promise<JwtPayload> {
		return verify(
			token,
			this.configService.get<string>(
				`jwt.${refresh ? 'refresh' : 'access'}.secret`,
			),
			{ ignoreExpiration },
		) as JwtPayload;
	}

	// async createAccessToken(): Promise<> {

	// }

	// async generateAccessTokenFromRefreshToken(
	// 	refreshToken: string,
	// 	oldAccessToken: string,
	// 	userId: string,
	// 	ipAddress: string,
	// ): Promise<JwtPayload> {
	// 	const existingToken = await this.findOne({ value: refreshToken });
	// 	const currentDate = new Date();
	// 	if (!existingToken) {
	// 		throw new NotFoundException('Refresh token not found');
	// 	}
	// 	if (existingToken.expiredAt < currentDate) {
	// 		throw new BadRequestException('Refresh token already expired');
	// 	}
	// 	const oldPayload = await this.validateToken(oldAccessToken, true);
	// 	const payload = {
	// 		sub: oldPayload.sub,
	// 	};
	// }
}
