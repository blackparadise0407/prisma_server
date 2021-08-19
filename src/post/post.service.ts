import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/base.service';
import { GeneralQueryDTO } from 'src/common/dto/shared.dto';
import { LoggerService } from 'src/logger/logger.service';
import {
	UserAction,
	UserActionType,
} from 'src/user/user-action/user-action.entity';
import { Like } from 'typeorm';
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

	public async findAllWithQuery(
		query: GeneralQueryDTO,
	): Promise<[Post[], number]> {
		const limit = query.limit || 0;
		const skip = (query.page - 1) * query.limit;
		const keyword = query.keyword || '';

		return this.repository.findAndCount({
			where: { content: Like('%' + keyword + '%') },
			take: limit,
			relations: ['user', 'user.avatar'],
			skip,
		});
	}
}
