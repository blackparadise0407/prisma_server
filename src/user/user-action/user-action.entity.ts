import { Photo } from 'src/photo/photo.entity';
import { Post } from 'src/post/post.entity';
import {
	BaseEntity,
	Column,
	CreateDateColumn,
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
	HAHA = 'HAHA',
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

	@Column({ nullable: true })
	content: string;

	@CreateDateColumn()
	createdAt: Date;

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

	@ManyToOne(() => Photo, (photo) => photo.userActions)
	@JoinColumn({ name: 'photoId' })
	photo: Photo;
}
