import { Controller, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { TokenService } from './token/token.service';

@Controller('auth')
export class AuthController {
	constructor(
		private readonly authService: AuthService,
		private readonly tokenService: TokenService,
	) {}

	@Post('register')
	async register(@Req() req: Request) {
		await this.authService.register(req.body);
		// console.log(await this.tokenService.validateToken());
		return { message: 'Ok' };
	}
}
