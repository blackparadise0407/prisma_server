import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { plainToClass } from 'class-transformer';
import { BaseService } from 'src/common/base.service';
import { EntityType } from 'src/common/enums';
import { LoggerService } from 'src/logger/logger.service';
import { Photo } from 'src/photo/photo.entity';
import { Post } from 'src/post/post.entity';
import { PostService } from 'src/post/post.service';
import { Repository } from 'typeorm';
import { ReactPostDTO } from './dto/user-action.dto';
import { UserAction, UserActionType } from './user-action/user-action.entity';
import { User } from './user.entity';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService extends BaseService<User, UserRepository> {
	constructor(
		@InjectRepository(User) repository: UserRepository,
		@InjectRepository(UserAction) public userActionRepo: Repository<UserAction>,
		logger: LoggerService,
		private postService: PostService,
	) {
		super(repository, logger);
	}

	comparePassword(str: string, hashedString: string): Promise<boolean> {
		return bcrypt.compare(str, hashedString);
	}

	findByEmailOrGoogleId(email: string, googleId: string) {
		return this.repository.findByEmailOrGoogleId(email, googleId);
	}

	async reactEntity(userId: number, payload: ReactPostDTO): Promise<void> {
		const { entityType, entityId } = payload;
		let entity: Post | Photo;
		switch (entityType) {
			case EntityType.POST:
				entity = (await this.postService.findById(entityId)) as Post;
				break;
			default:
				break;
		}
		if (!entity) {
			throw new BadRequestException('Entity not found');
		}
		const reaction = await this.userActionRepo.findOne({
			where: [
				{ userId, postId: entity.id },
				{ userId, photoId: entity.id },
			],
		});

		if (!reaction) {
			const newReaction = plainToClass(UserAction, {
				userId,
				type: UserActionType.REACTION,
				reactionType: payload.reactionType,
				postId: entity.id,
			} as UserAction);
			await this.userActionRepo.save(newReaction);
			await this.postService.update(entity.id, {
				reactionCount: entity.reactionCount + 1,
			});
		} else {
			if (reaction.reactionType !== payload.reactionType) {
				await this.userActionRepo.update(reaction.id, {
					reactionType: payload.reactionType,
				});
			} else {
				await this.userActionRepo.delete(reaction.id);
				await this.postService.update(entity.id, {
					reactionCount: entity.reactionCount - 1,
				});
			}
		}
	}

	async commentPostById(userId: number, postId: number) {}
}
