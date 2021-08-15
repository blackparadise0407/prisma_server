import { UserAction } from 'src/user/user-action/user-action.entity';
import { User } from 'src/user/user.entity';
import {
	BaseEntity,
	Column,
	CreateDateColumn,
	Entity,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';
import { Photo } from './photo/photo.entity';

@Entity('posts')
export class Post extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	content: string;

	@Column()
	userId: number;

	@Column({ default: 0 })
	reactionCount: number;

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;

	@ManyToOne(() => User, (user) => user.post)
	user: User;

	@OneToMany(() => Photo, (photo) => photo.post)
	photos: Photo[];

	@OneToMany(() => UserAction, (action) => action.post)
	userActions: UserAction[];
}
