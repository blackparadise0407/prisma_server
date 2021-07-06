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
	UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import {
	ApiBearerAuth,
	ApiOperation,
	ApiResponse,
	ApiTags,
} from '@nestjs/swagger';
import * as bluebird from 'bluebird';
import { Response } from 'express';
import { filter } from 'lodash';
import { CachingService } from 'src/caching/caching.service';
import { User } from 'src/common/decorators/user.decorator';
import { GeneralResponse } from 'src/common/responses/general-response';
import { MailService } from 'src/mail/mail.service';
import { UserService } from 'src/user/user.service';
import { AuthService } from './auth.service';
import { IConfirmation } from './confirmation/confirmation.interface';
import { ConfirmationService } from './confirmation/confirmation.service';
import { GoogleLoginDTO, LoginInputDTO } from './dto/login-input.dto';
import { CreateNewPasswordDTO, ResetPasswordDTO } from './dto/reset-input.dto';
import { ResetPasswordService } from './reset-password/reset-password.service';
import { TokenService } from './token/token.service';

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
		private readonly resetPasswordService: ResetPasswordService,
		private readonly cachingService: CachingService,
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

		const isValid = await this.userService.comparePassword(
			password,
			user.password,
		);

		if (!isValid) {
			throw new BadRequestException(
				'The email address or password you entered is incorrect',
			);
		}

		if (user.status !== 'VERIFIED') {
			throw new BadRequestException('Your account has not been confirmed yet');
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
	async confirm(@Query() query: { code: string }, @Res() res: Response) {
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

			await this.cachingService.delete(code);
			const redirectUrl = this.configService.get('client') + '/login';
			res.redirect(redirectUrl);
		}
	}

	@Post('google')
	@ApiResponse({ status: HttpStatus.OK })
	@ApiResponse({ status: HttpStatus.BAD_REQUEST, type: BadRequestException })
	@ApiOperation({
		summary: 'Google sign-in',
		description: 'Sign up or login with google account',
	})
	async registerGoogle(@Ip() ip: string, @Body() body: GoogleLoginDTO) {
		const { googleId } = body;
		const existingUser = await this.userService.findOne({
			$or: [
				{ googleId },
				{
					email: body.email,
				},
			],
		});

		if (!existingUser) {
			const user = await this.userService.create(body);
			const code = await this.confirmationService.createConfirmationCode({
				userId: user._id,
			});
			await this.mailService.sendUserConfirmation(user, code);
			return new GeneralResponse({});
		}

		if (!existingUser.googleId) {
			throw new BadRequestException(
				'There already an account linked with this email address',
			);
		}

		if (existingUser.status !== 'VERIFIED') {
			throw new BadRequestException(
				'Your account is not verified yet! Please confirm you account',
			);
		}

		const oldRefreshToken = await this.tokenService.findAll({
			userId: existingUser._id,
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
			sub: existingUser._id,
		});
		const refreshToken = await this.tokenService.createRefreshToken({
			userId: existingUser._id,
			ipAddress: ip,
		});
		return new GeneralResponse({
			data: {
				accessToken,
				refreshToken,
				user: existingUser,
			},
		});
	}

	@Post('forget-password')
	@ApiOperation({ summary: 'Forget password' })
	@ApiResponse({ status: HttpStatus.OK })
	@ApiResponse({ status: HttpStatus.BAD_REQUEST, type: BadRequestException })
	async forgetPassword(@Body() body: ResetPasswordDTO) {
		const { email } = body;
		const user = await this.userService.findOne({ email });
		if (!user) {
			throw new BadRequestException(
				'Account with this email address does not exist',
			);
		}
		const code = await this.confirmationService.createResetPasswordCode({
			userId: user._id,
		});
		await this.mailService.sendUserForgetPassword(user, code);
		return new GeneralResponse({
			message: 'An reset password link has been sent to your email address',
		});
	}

	@Get('reset')
	@ApiOperation({ summary: 'Reset link' })
	@ApiResponse({ status: HttpStatus.OK })
	@ApiResponse({ status: HttpStatus.BAD_REQUEST, type: BadRequestException })
	async getResetLink(@Query() query: { code: string }, @Res() res: Response) {
		const { code } = query;
		const confirmation = await this.confirmationService.findOne({
			code,
			type: 'FORGET_PASSWORD',
		});

		if (!confirmation) {
			throw new BadRequestException('Reset password code is invalid');
		}

		const user = await this.userService.findById(
			confirmation.userId.toString(),
		);
		if (!user) {
			throw new BadRequestException('User does not exist');
		}
		const currentDate = new Date();
		if (confirmation.expiredAt < currentDate) {
			const code = await this.confirmationService.createResetPasswordCode({
				userId: user._id,
			});
			await this.mailService.sendUserForgetPassword(user, code);
			throw new BadRequestException(
				'Reset password link has expired. A new link has been sent to you email address',
			);
		}

		const resetCode = await this.resetPasswordService.createResetCode(
			user._id.toString(),
		);

		const url = `${this.configService.get(
			'client',
		)}/reset-password?code=${resetCode}`;

		res.redirect(url);
	}

	@Post('reset')
	@ApiOperation({ summary: 'Reset user password' })
	@ApiResponse({ status: HttpStatus.OK })
	@ApiResponse({ status: HttpStatus.BAD_REQUEST, type: BadRequestException })
	async reset(
		@Query() query: { code: string },
		@Body() body: CreateNewPasswordDTO,
	) {
		const { code } = query;
		const resetDoc = await this.resetPasswordService.findOne({ code });
		if (!resetDoc) {
			throw new BadRequestException('Reset password code is invalid');
		}

		const currentDate = new Date();
		if (resetDoc.expiredAt < currentDate) {
			throw new BadRequestException('Reset password expired');
		}

		const user = await this.userService.findById(resetDoc.userId.toString());
		if (!user) {
			throw new BadRequestException('User does not exist');
		}

		if (user.email !== body.email) {
			throw new BadRequestException('Email address does not match');
		}

		await this.userService.findOneAndUpdate(
			{ _id: resetDoc.userId },
			{ password: body.password },
		);

		await this.resetPasswordService.deleteById(resetDoc._id);

		return new GeneralResponse({
			message: 'Your password has been successfully reset',
		});
	}

	@UseGuards(AuthGuard('jwt'))
	@Get('logout')
	@ApiOperation({
		summary: 'Log out',
		description: 'Revoke refresh token for user',
	})
	@ApiBearerAuth()
	@ApiResponse({ status: HttpStatus.OK })
	@ApiResponse({ status: HttpStatus.BAD_REQUEST, type: BadRequestException })
	async logout(@User() user) {
		await this.tokenService.revokeTokenForUser(user.id);
		return new GeneralResponse({});
	}
}
