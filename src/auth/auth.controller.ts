import {
	BadRequestException,
	Body,
	Controller,
	HttpStatus,
	Ip,
	Post,
	Req,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { UserService } from 'src/user/user.service';
import { AuthService } from './auth.service';
import { LoginInputDTO } from './dto/login-input.dto';
import { TokenService } from './token/token.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
	constructor(
		private readonly authService: AuthService,
		private readonly tokenService: TokenService,
		private readonly userService: UserService,
	) {}

	// @Post('register')
	// @ApiResponse({ status: HttpStatus.OK })
	// @ApiResponse({ status: HttpStatus.BAD_REQUEST, type: BadRequestException })
	// async register(@Req() req: Request) {
	// 	await this.authService.register(req.body);
	// 	console.log(await this.tokenService.createAccessToken({ sub: '123' }));
	// 	return { message: 'Ok' };
	// }

	@Post('login')
	@ApiOperation({ summary: 'Login' })
	@ApiResponse({ status: HttpStatus.OK })
	@ApiResponse({ status: HttpStatus.BAD_REQUEST, type: BadRequestException })
	async login(@Ip() Ip, @Body() body: LoginInputDTO) {
		const { phoneNumber, password } = body;
		const user = await this.userService.findByPhoneNumber(phoneNumber);
		if (!user) {
			throw new BadRequestException(
				'The phone number or password you entered is incorrect',
			);
		}
		const isValid = await this.userService.comparePassword(
			password,
			user.password,
		);
		if (!isValid) {
			throw new BadRequestException(
				'The phone number or password you entered is incorrect',
			);
		}
		// await this.tokenService.createAccessToken()
	}
}
