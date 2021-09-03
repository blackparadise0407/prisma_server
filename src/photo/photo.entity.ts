import { Attachment } from 'src/attachment/attachment.entity';
import { BaseSocialEntity } from 'src/common/base.entity';
import { UserAction } from 'src/user/user-action/user-action.entity';
import { User } from 'src/user/user.entity';
import {
	Column,
	Entity,
	JoinColumn,
	ManyToOne,
	OneToMany,
	OneToOne,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { Post } from '../post/post.entity';

@Entity('photos')
export class Photo extends BaseSocialEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => User, (user) => user.photos)
	@JoinColumn({ name: 'userId' })
	user: User;

	@Column()
	postId: number;

	@ManyToOne(() => Post, (post) => post.photos)
	post: Post;

	@Column()
	attachmentId: number;

	@OneToOne(() => Attachment, (attachment) => attachment.id)
	@JoinColumn()
	attachment: Attachment;

	@OneToMany(() => UserAction, (action) => action.photo)
	userActions: UserAction[];
}
