import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/base.service';
import { LoggerService } from 'src/logger/logger.service';
import { Post } from './post.entity';
import { PostRepository } from './post.repository';

@Injectable()
export class PostService extends BaseService<Post, PostRepository> {
	constructor(
		@InjectRepository(Post) repository: PostRepository,
		logger: LoggerService,
	) {
		super(repository, logger);
	}
}
