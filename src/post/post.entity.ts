import { BaseSocialEntity } from 'src/common/base.entity';
import { UserAction } from 'src/user/user-action/user-action.entity';
import { User } from 'src/user/user.entity';
import {
	Entity,
	JoinColumn,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { Photo } from '../photo/photo.entity';

@Entity('posts')
export class Post extends BaseSocialEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => User, (user) => user.posts)
	@JoinColumn({ name: 'userId' })
	user: User;

	@OneToMany(() => Photo, (photo) => photo.post)
	photos: Photo[];

	@OneToMany(() => UserAction, (action) => action.post)
	userActions: UserAction[];
}
