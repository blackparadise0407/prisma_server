import {
	BadRequestException,
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { randomBytes } from 'crypto';
import { Algorithm, sign, SignOptions, verify } from 'jsonwebtoken';
import * as moment from 'moment';
import { Model, Types } from 'mongoose';
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
		refresh = false,
		ignoreExpiration = false,
	): Promise<JwtPayload> {
		try {
			return verify(
				token,
				this.configService.get<string>(
					`jwt.${refresh ? 'refresh' : 'access'}.secret`,
				),
				{ ignoreExpiration },
			) as JwtPayload;
		} catch (e) {
			if (e.message === 'jwt expired') {
				throw new UnauthorizedException('Token expired');
			}
			throw new UnauthorizedException('Invalid token');
		}
	}

	async createAccessToken(payload: JwtPayload): Promise<string> {
		const opt: SignOptions = {
			algorithm: this.configService.get<string>(
				'jwt.access.algorithm',
			) as Algorithm,
			expiresIn: this.configService.get<number>('jwt.access.ttl'),
		};
		return sign(
			payload,
			this.configService.get<'string'>('jwt.access.secret'),
			opt,
		);
	}

	async createRefreshToken(tokenContent: {
		userId: string;
		ipAddress: string;
	}): Promise<string> {
		const { userId, ipAddress } = tokenContent;
		const secret = randomBytes(64).toString('hex');
		const token: RefreshToken = {
			user: Types.ObjectId(userId),
			value: secret,
			ipAddress,
			expiredAt: moment()
				.add(this.configService.get<number>('jwt.refresh.ttl'), 'seconds')
				.toDate(),
		};

		const refreshToken = await this.create(token);
		return refreshToken.value;
	}

	async generateAccessTokenFromRefreshToken(
		refreshToken: string,
		oldAccessToken: string,
	): Promise<string> {
		const existingToken = await this.findOne({ value: refreshToken });
		const currentDate = new Date();
		if (!existingToken) {
			throw new NotFoundException('Refresh token not found');
		}
		if (existingToken.expiredAt < currentDate) {
			throw new BadRequestException('Refresh token already expired');
		}
		const oldPayload = await this.validateToken(oldAccessToken, false, true);
		const payload: JwtPayload = {
			sub: oldPayload.sub,
		};
		const accessToken = await this.createAccessToken(payload);
		return accessToken;
	}

	async deleteRefreshTokenForUser(userId: string) {
		await this.delete({ _id: Types.ObjectId(userId) });
	}
}
