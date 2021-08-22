import {
	BaseEntity,
	Column,
	CreateDateColumn,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';

export class BaseSocialEntity extends BaseEntity {
	@Column()
	content: string;

	@Column({ default: 0 })
	reactionCount: number;

	@Column({ default: 0 })
	commentCount: number;

	@Column({ default: 0 })
	shareCount: number;

	@Column()
	userId: number;

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;
}
