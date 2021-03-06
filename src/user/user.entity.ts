import {
	BaseEntity,
	BeforeInsert,
	BeforeUpdate,
	Column,
	CreateDateColumn,
	Entity,
	Index,
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
import { UserAction } from './user-action/user-action.entity';
import { Photo } from 'src/photo/photo.entity';
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

	@Index()
	@Column()
	username: string;

	@Column({ unique: true })
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
	posts: Post[];

	@OneToMany(() => Photo, (photo) => photo.user)
	@JoinColumn()
	photos: Photo[];

	@OneToMany(() => UserAction, (action) => action.user)
	@JoinColumn()
	userActions: UserAction[];

	@BeforeInsert()
	async beforeInsert() {
		if (this.password) {
			const salt = await bcrypt.genSalt(SALT_ROUND);
			this.password = await bcrypt.hash(this.password, salt);
		}
	}

	@BeforeUpdate()
	async beforeUpdate() {
		if (this.password) {
			const salt = await bcrypt.genSalt(SALT_ROUND);
			this.password = await bcrypt.hash(this.password, salt);
		}
	}
}
