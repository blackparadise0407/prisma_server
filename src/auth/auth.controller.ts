import {
	BadRequestException,
	Body,
	Controller,
	Get,
	HttpStatus,
	Ip,
	Post,
	Query,
	Req,
	Res,
	UnauthorizedException,
	UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import {
	ApiBearerAuth,
	ApiOperation,
	ApiQuery,
	ApiResponse,
	ApiTags,
} from '@nestjs/swagger';
import axios from 'axios';
import * as bluebird from 'bluebird';
import { plainToClass } from 'class-transformer';
import { Request, Response } from 'express';
import { filter } from 'lodash';
import { CachingService } from 'src/caching/caching.service';
import { User } from 'src/common/decorators/user.decorator';
import { GeneralResponse } from 'src/common/responses/general-response';
import { MailService } from 'src/mail/mail.service';
import { UserStatus } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';
import { AuthService } from './auth.service';
import { ConfirmationType } from './confirmation/confirmation.entity';
import { ConfirmationService } from './confirmation/confirmation.service';
import { GoogleLoginDTO, LoginInputDTO } from './dto/login-input.dto';
import { CreateNewPasswordDTO, ResetPasswordDTO } from './dto/reset-input.dto';
import { TokenService } from './token/token.service';
import { User as UserEntity } from 'src/user/user.entity';
import { AttachmentService } from 'src/attachment/attachment.service';
import { Attachment, AttachmentType } from 'src/attachment/attachment.entity';

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
		private readonly attachmentService: AttachmentService,
		private readonly cachingService: CachingService,
	) {}

	@Post('login')
	@ApiOperation({ summary: 'Login' })
	@ApiResponse({ status: HttpStatus.OK })
	@ApiResponse({ status: HttpStatus.BAD_REQUEST, type: BadRequestException })
	async login(@Ip() ip, @Body() body: LoginInputDTO) {
		const { email, password } = body;
		const user = await this.userService.findOne(null, {
			where: { email },
			join: { alias: 'user', leftJoinAndSelect: { avatar: 'user.avatar' } },
		});
		if (!user) {
			throw new BadRequestException(
				'The email address or password you entered is incorrect',
			);
		}

		if (!user.password) {
			if (user.googleId) {
				throw new BadRequestException(
					'The email address you entered is already linked with another account',
				);
			}
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
			where: { user },
		});

		if (oldRefreshToken.length > 1) {
			const otherRefreshToken = filter(
				oldRefreshToken,
				(p) => p.ipAddress !== ip,
			);
			bluebird.map(otherRefreshToken, async (p) => {
				await this.tokenService.delete(p.id);
			});
		}
		let refreshToken: string;

		if (oldRefreshToken.length === 1) {
			refreshToken = await this.tokenService.renewRefreshToken(
				oldRefreshToken[0].id,
			);
		} else {
			refreshToken = await this.tokenService.createRefreshToken({
				userId: user.id,
				ipAddress: ip,
			});
		}

		const accessToken = await this.tokenService.createAccessToken({
			sub: user.id,
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
		const confirmation = await this.confirmationService.findOne(null, {
			where: { code },
		});

		if (!confirmation) {
			throw new BadRequestException(
				'Confirmation link is invalid or you has already confirm your account',
			);
		}

		const user = await this.userService.findById(confirmation.userId);
		if (!user) {
			throw new BadRequestException(
				'Confirmation link is invalid or you has already confirm your account',
			);
		}
		if (user.status === 'VERIFIED') {
			throw new BadRequestException('You has already confirm your account');
		}

		const currentDate = new Date();
		if (confirmation.expiredAt < currentDate) {
			const code = await this.confirmationService.createConfirmationCode({
				userId: user.id,
			});
			await this.mailService.sendUserConfirmation(user, code);
			res.send(
				new GeneralResponse({
					message:
						'Confirmation link has expired. A new confirmation link has been sent to you email address',
				}),
			);
		} else {
			await this.userService.update(confirmation.userId, {
				status: UserStatus.VERIFIED,
			});

			await this.cachingService.delete(code);
			const redirectUrl =
				this.configService.get('client') + `/login?email=${user.email}`;
			res.redirect(redirectUrl);
		}
	}

	@Get('google')
	@ApiResponse({ status: HttpStatus.OK })
	@ApiResponse({ status: HttpStatus.BAD_REQUEST, type: BadRequestException })
	@ApiOperation({
		summary: 'Google sign-in',
		description: 'Sign up or login with google account',
	})
	async registerGoogle(
		@Ip() ip: string,
		@Query('access_token') access_token: string,
	) {
		if (!access_token) {
			throw new BadRequestException('Access token is required');
		}
		const { data } = await axios.get(
			`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`,
		);

		const { sub: googleId } = data;
		let existingUser = await this.userService.findByEmailOrGoogleId(
			data.email,
			googleId,
		);

		if (!existingUser) {
			const body: GoogleLoginDTO = {
				username: data.name,
				email: data.email,
				googleId: data.sub,
			};
			const saveData = plainToClass(UserEntity, body);
			saveData.status = UserStatus.VERIFIED;
			existingUser = await this.userService.create(saveData);
			const attachment = plainToClass(Attachment, {
				size: 0,
				url: data.picture,
				type: AttachmentType.image,
				createdById: existingUser.id,
			} as Attachment);
			const savedAttachment = await this.attachmentService.create(attachment);
			await this.userService.update(existingUser.id, {
				avatar: savedAttachment,
			});
		}

		const oldRefreshToken = await this.tokenService.findAll({
			where: { userId: existingUser.id },
		});

		if (oldRefreshToken.length > 1) {
			const otherRefreshToken = filter(
				oldRefreshToken,
				(p) => p.ipAddress !== ip,
			);
			bluebird.map(otherRefreshToken, async (p) => {
				await this.tokenService.delete(p.id);
			});
		}

		const accessToken = await this.tokenService.createAccessToken({
			sub: existingUser.id,
		});
		const refreshToken = await this.tokenService.createRefreshToken({
			userId: existingUser.id,
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
		const user = await this.userService.findOne(null, { where: { email } });
		if (!user) {
			throw new BadRequestException(
				'Account with this email address does not exist',
			);
		}
		const code = await this.confirmationService.createForgetPasswordCode({
			userId: user.id,
		});
		await this.mailService.sendUserForgetPassword(user, code);
		return new GeneralResponse({
			message: 'An reset password link has been sent to your email address',
		});
	}

	@Get('reset-password')
	@ApiOperation({ summary: 'Reset link' })
	@ApiResponse({ status: HttpStatus.OK })
	@ApiResponse({ status: HttpStatus.BAD_REQUEST, type: BadRequestException })
	async getResetLink(@Query() query: { code: string }, @Res() res: Response) {
		const { code } = query;
		const confirmation = await this.confirmationService.findOne(null, {
			where: {
				code,
				type: ConfirmationType.forgetPassword,
			},
		});

		if (!confirmation) {
			throw new BadRequestException('Reset password code is invalid');
		}

		const user = await this.userService.findById(confirmation.userId);
		if (!user) {
			throw new BadRequestException('User does not exist');
		}
		const currentDate = new Date();
		if (confirmation.expiredAt < currentDate) {
			const code = await this.confirmationService.createResetPasswordCode({
				userId: user.id,
			});
			await this.mailService.sendUserForgetPassword(user, code);
			await this.confirmationService.delete(confirmation.id);
			throw new BadRequestException(
				'Reset password link has expired. A new link has been sent to you email address',
			);
		}

		const resetCode = await this.confirmationService.createResetPasswordCode({
			userId: user.id,
		});

		const url = `${this.configService.get(
			'client',
		)}/reset-password?code=${resetCode}`;

		res.redirect(url);
	}

	@Post('reset-password')
	@ApiOperation({ summary: 'Reset user password' })
	@ApiResponse({ status: HttpStatus.OK })
	@ApiResponse({ status: HttpStatus.BAD_REQUEST, type: BadRequestException })
	async reset(@Body() body: CreateNewPasswordDTO) {
		const resetDoc = await this.confirmationService.findOne(null, {
			where: { code: body.code },
		});
		if (!resetDoc) {
			throw new BadRequestException('Reset password code is invalid');
		}

		const currentDate = new Date();
		if (resetDoc.expiredAt < currentDate) {
			throw new BadRequestException('Reset password expired');
		}

		const user = await this.userService.findById(resetDoc.userId);
		if (!user) {
			throw new BadRequestException('User does not exist');
		}
		if (body.password !== body.confirm_password) {
			throw new BadRequestException('Passwords do not match');
		}
		await this.userService.update(user.id, { password: body.password });

		await this.confirmationService.delete(resetDoc.id);

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
	async logout(@User('sub') id: number) {
		await this.tokenService.revokeTokenForUser(id);
		return new GeneralResponse({});
	}

	// @UseGuards(AuthGuard('jwt'))
	@Post('refresh-token')
	@ApiOperation({
		summary: 'Refresh token',
		description: 'Retrieve access token from refresh token',
	})
	@ApiResponse({ status: HttpStatus.OK })
	@ApiResponse({ status: HttpStatus.BAD_REQUEST, type: BadRequestException })
	@ApiResponse({ status: HttpStatus.UNAUTHORIZED, type: UnauthorizedException })
	async refreshToken(
		@Req() { headers }: Request,
		@Body() body: { refreshToken?: string },
	) {
		if (!body.refreshToken) {
			throw new BadRequestException('Refresh token is required');
		}
		const refreshToken = await this.tokenService.findOne(null, {
			where: { value: body.refreshToken },
		});
		if (!refreshToken) {
			throw new BadRequestException('Refresh token is invalid');
		}

		const oldAccessToken = headers.authorization.split(' ')[1];
		const accessToken =
			await this.tokenService.generateAccessTokenFromRefreshToken(
				refreshToken.value,
				oldAccessToken,
			);
		return new GeneralResponse({
			data: {
				accessToken,
			},
		});
	}
}
