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
	ApiResponse,
	ApiTags,
} from '@nestjs/swagger';
import axios from 'axios';
import * as bluebird from 'bluebird';
import { plainToClass } from 'class-transformer';
import { Request, Response } from 'express';
import { filter } from 'lodash';
import { Attachment, AttachmentType } from 'src/attachment/attachment.entity';
import { AttachmentService } from 'src/attachment/attachment.service';
import { CachingService } from 'src/caching/caching.service';
import { User } from 'src/common/decorators/user.decorator';
import { GeneralResponse } from 'src/common/general-response';
import { MailService } from 'src/mail/mail.service';
import { User as UserEntity, UserStatus } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';
import { AuthService } from './auth.service';
import { ConfirmationType } from './confirmation/confirmation.entity';
import { ConfirmationService } from './confirmation/confirmation.service';
import { GoogleLoginDTO, LoginInputDTO } from './dto/login-input.dto';
import { CreateNewPasswordDTO, ResetPasswordDTO } from './dto/reset-input.dto';
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
		private readonly attachmentService: AttachmentService,
		private readonly cachingService: CachingService,
	) {}

	@Post('login')
	@ApiOperation({ summary: 'Login' })
	@ApiResponse({ status: HttpStatus.OK })
	@ApiResponse({ status: HttpStatus.BAD_REQUEST, type: BadRequestException })
	async login(@Ip() ip: string, @Body() body: LoginInputDTO) {
		const { accessToken, refreshToken, user } = await this.authService.login(
			body,
			ip,
		);
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
		const { status, redirectUrl } = await this.authService.verifyConfirmation(
			code,
		);
		if (status) {
			res.redirect(redirectUrl);
		} else {
			res.send(
				new GeneralResponse({
					message:
						'Confirmation link has expired. A new confirmation link has been sent to you email address',
				}),
			);
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
		await this.authService.handleForgetPassword(body);
		return new GeneralResponse({
			message: 'An reset password link has been sent to your email address',
		});
	}

	@Get('reset-password')
	@ApiOperation({ summary: 'Reset link' })
	@ApiResponse({ status: HttpStatus.OK })
	@ApiResponse({ status: HttpStatus.BAD_REQUEST, type: BadRequestException })
	async getResetPassword(
		@Query() query: { code: string },
		@Res() res: Response,
	) {
		const { code } = query;
		const url = await this.authService.getResetLink(code);
		res.redirect(url);
	}

	@Post('reset-password')
	@ApiOperation({ summary: 'Reset user password' })
	@ApiResponse({ status: HttpStatus.OK })
	@ApiResponse({ status: HttpStatus.BAD_REQUEST, type: BadRequestException })
	async handleResetPassword(@Body() body: CreateNewPasswordDTO) {
		await this.authService.resetPassword(body);
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
		const oldAccessToken = headers.authorization.split(' ')[1];
		const accessToken = await this.authService.retrieveAccessToken(
			oldAccessToken,
			body.refreshToken,
		);
		return new GeneralResponse({
			data: {
				accessToken,
			},
		});
	}
}
