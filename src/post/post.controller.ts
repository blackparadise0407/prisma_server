import {
	BadRequestException,
	Body,
	Controller,
	Get,
	HttpStatus,
	Post,
	Query,
	UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { plainToClass } from 'class-transformer';
import { User } from 'src/common/decorators/user.decorator';
import { GeneralResponse } from 'src/common/general-response';
import { PostCreateDTO } from './dto/create-post.dto';
import { PostService } from './post.service';
import { Post as PostEntity } from './post.entity';
import { GeneralQueryDTO } from 'src/common/dto/shared.dto';

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
	async create(@User('sub') userId: number, @Body() body: PostCreateDTO) {
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
	async get(@Query() query: GeneralQueryDTO) {
		const posts = await this.postService.findAllWithQuery(query);
		return new GeneralResponse({ data: posts });
	}
}
