import {
	BaseEntity,
	BeforeInsert,
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	OneToMany,
	OneToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';
import { Profile } from '../profile/profile.entity';
import * as bcrypt from 'bcrypt';
import { RefreshToken } from 'src/auth/token/refresh-token.entity';
import { Attachment } from 'src/attachment/attachment.entity';
import { Confirmation } from 'src/auth/confirmation/confirmation.entity';
import { Post } from 'src/post/post.entity';
import { Exclude } from 'class-transformer';
const SALT_ROUND = 10;

export enum UserStatus {
	VERIFIED = 'VERIFIED',
	PENDING = 'PENDING',
	DEACTIVATED = 'DEACTIVATED',
}
@Entity('users')
export class User extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	username: string;

	@Column()
	email: string;

	@Exclude({ toPlainOnly: true })
	@Column({ nullable: true })
	password: string;

	@Column({ default: '' })
	googleId: string;

	@Column({ default: '' })
	facebookId: string;

	@Column({ type: 'timestamptz', default: null, nullable: true })
	lastOnline: Date;

	@Column({ type: 'enum', enum: UserStatus, default: UserStatus.PENDING })
	status: UserStatus;

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;

	@OneToOne(() => Profile)
	@JoinColumn()
	profile: Profile;

	@OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user)
	refreshToken: RefreshToken[];

	@OneToOne(() => Attachment)
	@JoinColumn({ name: 'avatar' })
	avatar: Attachment;

	@OneToMany(() => Attachment, (attachment) => attachment.createdBy)
	@JoinColumn()
	attachments: Attachment[];

	@OneToMany(() => Confirmation, (confirmation) => confirmation.user)
	@JoinColumn()
	confirmation: Confirmation[];

	@OneToMany(() => Post, (post) => post.user)
	@JoinColumn()
	post: Post[];

	@BeforeInsert()
	async beforeInsert() {
		if (this.password) {
			const salt = await bcrypt.genSalt(SALT_ROUND);
			this.password = await bcrypt.hash(this.password, salt);
		}
	}
}
