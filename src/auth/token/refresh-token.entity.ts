import { User } from 'src/user/user.entity';
import {
	BaseEntity,
	Column,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('refresh_tokens')
export class RefreshToken extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ unique: true })
	value: string;

	@Column()
	userId: number;

	@ManyToOne(() => User, (user) => user.refreshToken)
	@JoinColumn({ name: 'userId' })
	user: User;

	@Column()
	ipAddress: string;

	@Column({ type: 'timestamptz' })
	expiredAt: Date;
}
