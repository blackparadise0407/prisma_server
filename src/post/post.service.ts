import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import _, { forEach, groupBy, map, reduce } from 'lodash';
import { BaseService } from 'src/common/base.service';
import { GeneralQueryDTO } from 'src/common/dto/shared.dto';
import { LoggerService } from 'src/logger/logger.service';
import { UserAction } from 'src/user/user-action/user-action.entity';
import { Like, Repository } from 'typeorm';
import { Photo } from '../photo/photo.entity';
import { Post } from './post.entity';
import { PostRepository } from './post.repository';

@Injectable()
export class PostService extends BaseService<Post, PostRepository> {
	constructor(
		@InjectRepository(Post) repository: PostRepository,
		@InjectRepository(UserAction)
		private userActionRepo: Repository<UserAction>,
		logger: LoggerService,
	) {
		super(repository, logger);
	}

	public async findAllWithQuery(
		query: GeneralQueryDTO,
	): Promise<[any, number]> {
		const limit = query.limit || 0;
		const skip = (query.page - 1) * query.limit;
		const keyword = query.keyword || '';

		const [posts, total] = await this.repository
			.createQueryBuilder('posts')
			.where('posts.content like :content', { content: `%${keyword}%` })
			.take(limit)
			.skip(skip)
			.leftJoinAndSelect('posts.user', 'user')
			.leftJoinAndSelect('user.avatar', 'avatar')
			.leftJoinAndSelect(
				'posts.userActions',
				'user_actions',
				'user_actions.postId = posts.id AND user_actions.type = :type AND user_actions.userId = :userId',
				{ type: 'REACTION', userId: 2 },
			)
			.getManyAndCount();

		// const [posts, total] = await this.repository.findAndCount({
		// 	where: { content: Like('%' + keyword + '%') },
		// 	take: limit,
		// 	relations: ['user', 'user.avatar'],
		// 	skip,
		// });

		if (!posts.length) {
			return [[], 0];
		}

		const postIdsConditions = reduce(
			posts,
			(res, curr, idx) => {
				return (res += `u."postId"=${curr.id} ${
					idx !== total - 1 ? 'or ' : ''
				}`);
			},
			'',
		);

		const actions = await this.userActionRepo.query(
			`select count(u."id"), u."reactionType", u."postId" from user_actions u where ${postIdsConditions} group by u."reactionType", u."postId"`,
		);
		const groupActions = groupBy(actions, 'postId');
		forEach(groupActions, (i, key) => {
			groupActions[key] = map(
				i.sort((a, b) => b.count - a.count),
				(_i) => ({ reactionType: _i.reactionType, count: _i.count }),
			);
		});
		const finalResults = map(posts, (i) => ({
			...i,
			['reactions']: groupActions[i.id],
		}));
		return [finalResults, total];
	}

	async getCommentByPostId(
		postId: number,
		query: GeneralQueryDTO,
	): Promise<any> {
		return 'Hello';
	}
}
