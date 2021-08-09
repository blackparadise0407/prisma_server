import {
	BadRequestException,
	Body,
	Controller,
	Get,
	HttpStatus,
	Logger,
	Post,
	UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { plainToClass } from 'class-transformer';
import { User } from 'src/common/decorators/user.decorator';
import { GeneralResponse } from 'src/common/responses/general-response';
import { PostCreateDTO } from './dto/create-post.dto';
import { PostService } from './post.service';
import { Post as PostEntity } from './post.entity';

@ApiTags('post')
@Controller('post')
export class PostController {
	constructor(private readonly postService: PostService) {}

	@UseGuards(AuthGuard('jwt'))
	@Post('')
	@ApiResponse({ status: HttpStatus.OK })
	@ApiResponse({ status: HttpStatus.BAD_REQUEST, type: BadRequestException })
	@ApiOperation({
		summary: 'Create new post',
		description: 'Create new post wiht content or photos',
	})
	async create(@User('id') userId: string, @Body() body: PostCreateDTO) {
		const post = plainToClass(PostEntity, { ...body, userId });
		await this.postService.create(post);
		return new GeneralResponse({
			data: post,
		});
	}

	@UseGuards(AuthGuard('jwt'))
	@Get('')
	@ApiResponse({ status: HttpStatus.OK })
	@ApiResponse({ status: HttpStatus.BAD_REQUEST, type: BadRequestException })
	@ApiOperation({
		summary: 'Get posts',
		description: 'Get posts',
	})
	async get() {
		const posts = await this.postService.findAll({
			relations: ['user'],
		});
		return new GeneralResponse({ data: posts });
	}
}
