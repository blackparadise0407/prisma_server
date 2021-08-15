import { Photo } from 'src/post/photo/photo.entity';
import { Post } from 'src/post/post.entity';
import {
	BaseEntity,
	Column,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../user.entity';

export enum UserActionType {
	REACTION = 'REACTION',
	COMMENT = 'COMMENT',
	SHARE = 'SHARE',
}

export enum ReactionType {
	LIKE = 'LIKE',
	LOVE = 'LOVE',
	WOW = 'WOW',
	ANGER = 'ANGER',
	SAD = 'SAD',
}

@Entity('user_actions')
export class UserAction extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ type: 'enum', enum: UserActionType })
	type: UserActionType;

	@Column({ type: 'enum', enum: ReactionType, nullable: true })
	reactionType: ReactionType;

	@Column()
	userId: number;

	@ManyToOne(() => User, (user) => user.userActions)
	@JoinColumn({ name: 'userId' })
	user: User;

	@Column({ nullable: true })
	postId: number;

	@ManyToOne(() => Post, (post) => post.userActions)
	@JoinColumn({ name: 'postId' })
	post: Post;

	@Column({ nullable: true })
	photoId: number;

	@ManyToOne(() => Post, (post) => post.userActions)
	@JoinColumn({ name: 'photoId' })
	photo: Photo;
}