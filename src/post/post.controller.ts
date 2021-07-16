import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { User } from 'src/common/decorators/user.decorator';
import { GeneralResponse } from 'src/common/responses/general-response';
import { PostCreateDTO } from './dto/create-post.dto';
import { PostService } from './post.service';

@ApiTags('post')
@Controller('post')
export class PostController {
	constructor(private readonly postService: PostService) {}
	@UseGuards(AuthGuard('jwt'))
	@Post('')
	async create(@User('id') userId: string, @Body() body: PostCreateDTO) {
		const post = await this.postService.create({ ...body, userId });

		return new GeneralResponse({
			data: post,
		});
	}
}
