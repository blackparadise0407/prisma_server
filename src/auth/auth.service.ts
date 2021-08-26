import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { map as bbMap } from 'bluebird';
import { filter } from 'lodash';
import { MailService } from 'src/mail/mail.service';
import { User, UserStatus } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';
import { ConfirmationType } from './confirmation/confirmation.entity';
import { ConfirmationService } from './confirmation/confirmation.service';
import { LoginInputDTO } from './dto/login-input.dto';
import { ResetPasswordDTO } from './dto/reset-input.dto';
import { TokenService } from './token/token.service';

@Injectable()
export class AuthService {
	constructor(
		private readonly userService: UserService,
		private readonly tokenService: TokenService,
		private readonly confirmationService: ConfirmationService,
		private readonly mailService: MailService,
		private readonly configService: ConfigService,
	) {}
	public async login(
		payload: LoginInputDTO,
		ipAddress: string,
	): Promise<{ user: User; accessToken: string; refreshToken: string }> {
		const { email, password } = payload;
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
				(p) => p.ipAddress !== ipAddress,
			);
			bbMap(otherRefreshToken, async (p) => {
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
				ipAddress,
			});
		}

		const accessToken = await this.tokenService.createAccessToken({
			sub: user.id,
		});
		return {
			accessToken,
			refreshToken,
			user,
		};
	}

	public async verifyConfirmation(
		code: string,
	): Promise<{ status: boolean; redirectUrl: string }> {
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
			return { status: false, redirectUrl: null };
		} else {
			await this.userService.update(confirmation.userId, {
				status: UserStatus.VERIFIED,
			});

			// await this.cachingService.delete(code);
			const redirectUrl =
				this.configService.get('client') + `/login?email=${user.email}`;
			return { status: true, redirectUrl };
		}
	}

	public async handleForgetPassword(payload: ResetPasswordDTO): Promise<void> {
		const { email } = payload;
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
	}

	public async getResetLink(code: string): Promise<string> {
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

		return `${this.configService.get(
			'client',
		)}/reset-password?code=${resetCode}`;
	}
}
