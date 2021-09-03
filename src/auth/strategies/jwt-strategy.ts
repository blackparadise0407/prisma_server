import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../jwt-payload';
import { TokenService } from '../token/token.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(
		private readonly tokenService: TokenService,
		private readonly configService: ConfigService,
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: true,
			passReqToCallback: true,
			secretOrKey: configService.get<string>('jwt.access.secret'),
		});
	}

	validate(req: Request): JwtPayload {
		const {
			headers: { authorization },
		} = req;
		const token = authorization.split(' ')[1];
		return this.tokenService.validateToken(token, false, false);
	}
}
