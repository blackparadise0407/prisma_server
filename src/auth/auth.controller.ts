import {
	BadRequestException,
	Body,
	Controller,
	Get,
	HttpStatus,
	Ip,
	Post,
	Query,
	Res,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { filter } from 'lodash';
import { GeneralResponse } from 'src/common/responses/general-response';
import { MailService } from 'src/mail/mail.service';
import { UserService } from 'src/user/user.service';
import { AuthService } from './auth.service';
import { ConfirmationService } from './confirmation/confirmation.service';
import { LoginInputDTO } from './dto/login-input.dto';
import { TokenService } from './token/token.service';
import * as bluebird from 'bluebird';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
	constructor(
		private readonly authService: AuthService,
		private readonly tokenService: TokenService,
		private readonly userService: UserService,
		private readonly mailService: MailService,
		private readonly confirmationService: ConfirmationService,
		private readonly configService: ConfigService,
	) {}

	@Post('login')
	@ApiOperation({ summary: 'Login' })
	@ApiResponse({ status: HttpStatus.OK })
	@ApiResponse({ status: HttpStatus.BAD_REQUEST, type: BadRequestException })
	async login(@Ip() ip, @Body() body: LoginInputDTO) {
		const { email, password } = body;
		const user = await this.userService.findOne({ email });
		if (!user) {
			throw new BadRequestException(
				'The email address or password you entered is incorrect',
			);
		}

		if (user.status !== 'VERIFIED') {
			throw new BadRequestException('Your account has not been confirmed yet');
		}

		const isValid = await this.userService.comparePassword(
			password,
			user.password,
		);

		if (!isValid) {
			throw new BadRequestException(
				'The email address or password you entered is incorrect',
			);
		}

		const oldRefreshToken = await this.tokenService.findAll({
			userId: user._id,
		});

		if (oldRefreshToken.length > 1) {
			const otherRefreshToken = await filter(
				oldRefreshToken,
				(p) => p.ipAddress !== ip,
			);
			bluebird.map(otherRefreshToken, async (p) => {
				await this.tokenService.delete({ _id: p._id });
			});
		}

		const accessToken = await this.tokenService.createAccessToken({
			sub: user._id,
		});
		const refreshToken = await this.tokenService.createRefreshToken({
			userId: user._id,
			ipAddress: ip,
		});
		return new GeneralResponse({
			data: {
				accessToken,
				refreshToken,
				user,
			},
		});
	}

	@Get('confirmation')
	@ApiOperation({ summary: 'Confirmation' })
	@ApiResponse({ status: HttpStatus.OK })
	@ApiResponse({ status: HttpStatus.BAD_REQUEST, type: BadRequestException })
	async confirm(@Ip() ip, @Query() query, @Res() res: Response) {
		const { code } = query;
		const confirmation = await this.confirmationService.findOne({ code });

		if (!confirmation) {
			throw new BadRequestException(
				'Confirmation link is invalid or you has already confirm your account',
			);
		}

		const currentDate = new Date();
		if (confirmation.expiredAt < currentDate) {
			const user = await this.userService.findById(
				confirmation.userId.toString(),
			);
			if (!user) {
				throw new BadRequestException(
					'Confirmation link is invalid or you has already confirm your account',
				);
			}

			if (user.status === 'VERIFIED') {
				throw new BadRequestException('You has already confirm your account');
			}

			const code = await this.confirmationService.createConfirmationCode({
				userId: user._id,
			});
			await this.mailService.sendUserConfirmation(user, code);
			res.send(
				new GeneralResponse({
					message:
						'Confirmation link has expired. A new confirmation link has been sent to you email address',
				}),
			);
		} else {
			await this.userService.findOneAndUpdate(
				{ _id: confirmation.userId },
				{ status: 'VERIFIED' },
			);

			await this.confirmationService.delete({ _id: confirmation._id });
			const redirectUrl = this.configService.get('client');
			res.redirect(redirectUrl);
		}
	}
}
