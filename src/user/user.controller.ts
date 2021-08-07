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
import { User as UserEntity } from './user.entity';
import { User } from 'src/common/decorators/user.decorator';
import { UserService } from './user.service';

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
		const { email } = body;
		const existingUser = await this.userService.findOne(null, {
			where: { email },
		});
		if (existingUser) {
			throw new BadRequestException('Email address already in use');
		}
		const data = new UserEntity();
		data.email = body.email;
		data.username = body.username;
		data.password = body.password;
		const user = await this.userService.create(data);
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
