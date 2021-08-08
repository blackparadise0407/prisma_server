import {
	BadRequestException,
	ForbiddenException,
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { randomBytes } from 'crypto';
import { Algorithm, sign, SignOptions, verify } from 'jsonwebtoken';
import * as moment from 'moment';
import { BaseService } from 'src/common/base.service';
import { LoggerService } from 'src/logger/logger.service';
import { Repository } from 'typeorm';
import { JwtPayload } from '../jwt-payload';
import { RefreshToken } from './refresh-token.entity';

@Injectable()
export class TokenService extends BaseService<
	RefreshToken,
	Repository<RefreshToken>
> {
	constructor(
		@InjectRepository(RefreshToken)
		repository: Repository<RefreshToken>,
		logger: LoggerService,
		private readonly configService: ConfigService,
	) {
		super(repository, logger);
	}

	validateToken(
		token: string,
		refresh = false,
		ignoreExpiration = false,
	): JwtPayload {
		if (!token) {
			throw new UnauthorizedException();
		}
		try {
			return verify(
				token,
				this.configService.get<string>(
					`jwt.${refresh ? 'refresh' : 'access'}.secret`,
				),
				{
					ignoreExpiration,
					algorithms: [
						this.configService.get<string>('jwt.access.algorithm') as Algorithm,
					],
				},
			) as JwtPayload;
		} catch (e) {
			if (e.message === 'jwt expired') {
				throw new ForbiddenException('Token expired');
			}
			throw new ForbiddenException('Invalid token');
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

	async renewRefreshToken(tokenId: string | number): Promise<string> {
		const secret = randomBytes(64).toString('hex');
		const expiredAt = moment()
			.add(this.configService.get<number>('jwt.refresh.ttl'), 'seconds')
			.toDate();
		const token = await this.update(tokenId, { value: secret, expiredAt });
		return token.value;
	}

	async createRefreshToken(tokenContent: {
		userId: number;
		ipAddress: string;
	}): Promise<string> {
		const { userId, ipAddress } = tokenContent;
		const secret = randomBytes(64).toString('hex');

		const token = plainToClass(RefreshToken, {
			userId,
			value: secret,
			ipAddress,
			expiredAt: moment()
				.add(this.configService.get<number>('jwt.refresh.ttl'), 'seconds')
				.toDate(),
		});

		const refreshToken = await this.create(token);
		return refreshToken.value;
	}

	async generateAccessTokenFromRefreshToken(
		refreshToken: string,
		oldAccessToken: string,
	): Promise<string> {
		const existingToken = await this.findOne(null, {
			where: { value: refreshToken },
		});
		const currentDate = new Date();
		if (!existingToken) {
			throw new NotFoundException('Refresh token not found');
		}
		if (existingToken.expiredAt < currentDate) {
			this.delete(existingToken.id);
			throw new BadRequestException('Refresh token already expired');
		}
		const oldPayload = this.validateToken(oldAccessToken, false, true);
		const payload: JwtPayload = {
			sub: oldPayload.sub,
		};
		const accessToken = await this.createAccessToken(payload);
		return accessToken;
	}

	async revokeTokenForUser(userId: number) {
		await this.delete({ userId });
	}
}
