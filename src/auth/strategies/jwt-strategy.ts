import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
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
			jwtFromRequest: ExtractJwt.fromExtractors([
				ExtractJwt.fromAuthHeaderAsBearerToken(),
				ExtractJwt.fromUrlQueryParameter('access_token'),
			]),
			secretOrKey: configService.get<string>('jwt.access.secret'),
			passReqToCallback: true,
		});
	}

	// async validate(payload: JwtPayload) {
	// 	const result = await this.tokenService.validatePayload(payload);
	// 	if (!result) {
	// 		throw new UnauthorizedException();
	// 	}
	// 	return result;
	// }
}
