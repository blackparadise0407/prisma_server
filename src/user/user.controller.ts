import {
	BadRequestException,
	Body,
	Controller,
	Get,
	HttpStatus,
	Post,
	UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateUserDTO } from './dto/create-user.dto';
import { User } from './user.schema';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@UseGuards(AuthGuard('jwt'))
	@Get()
	async get(): Promise<User[]> {
		return this.userService.findAll();
	}

	@Post('register')
	@ApiOperation({ summary: 'Register' })
	@ApiResponse({ status: HttpStatus.OK })
	@ApiResponse({ status: HttpStatus.BAD_REQUEST, type: BadRequestException })
	async register(@Body() body: CreateUserDTO): Promise<void> {
		const { phoneNumber } = body;
		const existingUser = await this.userService.findByPhoneNumber(phoneNumber);
		if (existingUser) {
			throw new BadRequestException('Phone number already in use');
		}
		const user = await this.userService.create(body);
	}
}
