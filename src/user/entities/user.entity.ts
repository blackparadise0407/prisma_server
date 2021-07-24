import {
	BaseEntity,
	BeforeInsert,
	Column,
	Entity,
	JoinColumn,
	OneToOne,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { Profile } from './profile.entity';
import * as bcrypt from 'bcrypt';
const SALT_ROUND = 10;

export enum UserStatus {
	VERIFIED = 'VERIFIED',
	PENDING = 'PENDING',
	DEACTIVATED = 'DEACTIVATED',
}

@Entity({ name: 'users' })
export class User extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	username: string;

	@Column()
	email: string;

	@Column()
	password: string;

	@Column()
	googleId: string;

	@Column()
	facebookId?: string;

	@Column({ type: 'enum', enum: UserStatus, default: UserStatus.PENDING })
	status: UserStatus;

	@OneToOne(() => Profile)
	@JoinColumn()
	profile: Profile;

	@BeforeInsert()
	async beforeInsert() {
		const salt = await bcrypt.genSalt(SALT_ROUND);
		this.password = await bcrypt.hash(this.password, salt);
	}
}
