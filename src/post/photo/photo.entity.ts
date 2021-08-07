import { Attachment } from 'src/attachment/attachment.entity';
import { User } from 'src/user/user.entity';
import {
	BaseEntity,
	Column,
	Entity,
	JoinColumn,
	ManyToOne,
	OneToOne,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { Post } from '../post.entity';

@Entity('photos')
export class Photo extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	content: string;

	@Column()
	userId: number;

	@ManyToOne(() => User, (user) => user.id)
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
}
