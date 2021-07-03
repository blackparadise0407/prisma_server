import {
	BadRequestException,
	Body,
	Controller,
	Get,
	HttpStatus,
	Ip,
	Post,
	UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ConfirmationService } from 'src/auth/confirmation/confirmation.service';
import { GeneralResponse } from 'src/common/responses/general-response';
import { MailService } from 'src/mail/mail.service';
import { CreateUserDTO } from './dto/create-user.dto';
import { User } from './user.schema';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
	constructor(
		private readonly userService: UserService,
		private readonly confirmationService: ConfirmationService,
		private readonly mailService: MailService,
		private readonly configService: ConfigService,
	) {}

	@UseGuards(AuthGuard('jwt'))
	@Get()
	async get(): Promise<User[]> {
		return this.userService.findAll();
	}

	@Post('register')
	@ApiOperation({ summary: 'Register' })
	@ApiResponse({ status: HttpStatus.OK })
	@ApiResponse({ status: HttpStatus.BAD_REQUEST, type: BadRequestException })
	async register(@Ip() ip: string, @Body() body: CreateUserDTO): Promise<any> {
		const { email } = body;
		const existingUser = await this.userService.findOne({ email });
		if (existingUser) {
			throw new BadRequestException('Email address already in use');
		}
		const user = await this.userService.create(body);
		const code = await this.confirmationService.createConfirmationCode({
			userId: user._id,
		});
		await this.mailService.sendUserConfirmation(user, code);
		return new GeneralResponse({});
	}
}
