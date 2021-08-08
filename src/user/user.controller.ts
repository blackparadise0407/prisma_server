import {
	BadRequestException,
	Body,
	Controller,
	Get,
	HttpStatus,
	Ip,
	Post,
	UnauthorizedException,
	UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ConfirmationService } from 'src/auth/confirmation/confirmation.service';
import { GeneralResponse } from 'src/common/responses/general-response';
import { MailService } from 'src/mail/mail.service';
import { CreateUserDTO } from './dto/create-user.dto';
import { User as UserEntity, UserStatus } from './user.entity';
import { User } from 'src/common/decorators/user.decorator';
import { UserService } from './user.service';
import { classToPlain, plainToClass } from 'class-transformer';

@Controller('user')
export class UserController {
	constructor(
		private readonly userService: UserService,
		private readonly confirmationService: ConfirmationService,
		private readonly mailService: MailService,
		private readonly configService: ConfigService,
	) {}

	@Post('register')
	@ApiOperation({ summary: 'Register' })
	@ApiResponse({ status: HttpStatus.OK })
	@ApiResponse({ status: HttpStatus.BAD_REQUEST, type: BadRequestException })
	async register(
		@Ip() ip: string,
		@Body() body: CreateUserDTO,
	): Promise<GeneralResponse> {
		console.log(body);
		const { email } = body;
		const existingUser = await this.userService.findOne(null, {
			where: { email },
		});
		if (existingUser) {
			if (existingUser.status === UserStatus.VERIFIED) {
				throw new BadRequestException('Email address already in use');
			}
			const existedConfirmationCode = await this.confirmationService.findAll({
				where: { userId: existingUser.id },
			});
			if (!existedConfirmationCode.length) {
				const code = await this.confirmationService.createConfirmationCode({
					userId: existingUser.id,
				});
				await this.mailService.sendUserConfirmation(existingUser, code);
				throw new BadRequestException(
					'A new confirmation link has been sent to your email address',
				);
			} else {
				throw new BadRequestException(
					'A confirmation link has already been sent to your email address',
				);
			}
		}
		const newUser = plainToClass(UserEntity, body);

		const user = await this.userService.create(newUser);
		const code = await this.confirmationService.createConfirmationCode({
			userId: user.id,
		});
		await this.mailService.sendUserConfirmation(user, code);
		return new GeneralResponse({});
	}

	@UseGuards(AuthGuard('jwt'))
	@Get('')
	@ApiOperation({ summary: "Retrieve user's info" })
	@ApiResponse({ status: HttpStatus.OK })
	@ApiResponse({ status: HttpStatus.UNAUTHORIZED, type: UnauthorizedException })
	async info(@User('id') id: string) {
		return await this.userService.findById(id);
	}
}
