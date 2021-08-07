import { User } from 'src/user/user.entity';
import {
	BaseEntity,
	Column,
	Entity,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
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

	@ManyToOne(() => User, (user) => user.post)
	user: User;

	@OneToMany(() => Photo, (photo) => photo.post)
	photos: Photo[];
}
