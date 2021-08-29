import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { forEach, groupBy, map, reduce } from 'lodash';
import { BaseService } from 'src/common/base.service';
import { GeneralQueryDTO } from 'src/common/dto/shared.dto';
import { LoggerService } from 'src/logger/logger.service';
import {
	UserAction,
	UserActionType,
} from 'src/user/user-action/user-action.entity';
import { Repository } from 'typeorm';
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
			.leftJoinAndSelect('posts.user', 'user')
			.leftJoinAndSelect('user.avatar', 'avatar')
			.leftJoinAndSelect(
				'posts.userActions',
				'user_actions',
				'user_actions.postId = posts.id AND user_actions.type = :type AND user_actions.userId = :userId',
				{ type: UserActionType.REACTION, userId: 2 },
			)
			.orderBy('posts.createdAt', 'DESC')
			.take(limit)
			.skip(skip)
			.getManyAndCount();

		if (!posts.length) {
			return [[], 0];
		}

		const postIdsConditions = reduce(
			posts,
			(res, curr, idx) => {
				return (res += `u."postId"=${curr.id} ${
					idx !== posts.length - 1 ? 'or ' : ''
				}`);
			},
			'',
		);

		const actions = await this.userActionRepo.query(
			`select count(u."id"), u."reactionType", u."postId", u."type" from user_actions u where u."type"=$1 and (${postIdsConditions}) group by u."reactionType", u."postId", u."type"`,
			[UserActionType.REACTION.toString()],
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
	): Promise<[UserAction[], number]> {
		const limit = query.limit || 0;
		const skip = (query.page - 1) * query.limit;

		const post = await this.findById(postId);
		if (!post) {
			throw new BadRequestException('Post not found');
		}

		const results = await this.userActionRepo
			.createQueryBuilder('actions')
			.leftJoinAndSelect('actions.user', 'user', 'user.id = actions.userId')
			.leftJoinAndSelect(
				'user.avatar',
				'attachment',
				'user.avatar = attachment.id',
			)
			.where('actions.postId = :postId', { postId })
			.andWhere('actions.type = :type', { type: UserActionType.COMMENT })
			.andWhere('actions.replyToId IS NULL')
			.orderBy('actions.createdAt', 'DESC')
			.take(limit)
			.skip(skip)
			.getManyAndCount();

		return results;
	}

	public async getRepliesByCommentId(commentId: number): Promise<UserAction[]> {
		const existingComment = await this.userActionRepo.findOne(commentId);
		if (!existingComment) {
			throw new NotFoundException('The requested resource not found');
		}

		const results = await this.userActionRepo.find({
			where: { replyToId: commentId },
			relations: ['user', 'user.avatar'],
		});
		return results;
	}
}
