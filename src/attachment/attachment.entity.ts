import { User } from 'src/user/user.entity';
import {
	BaseEntity,
	Column,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
} from 'typeorm';

export enum AttachmentType {
	image = 'IMAGE',
	video = 'VIDEO',
	file = 'FILE',
}

@Entity('attachments')
export class Attachment extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ type: 'enum', enum: AttachmentType })
	type: AttachmentType;

	@Column()
	createdById: number;

	@ManyToOne(() => User, (user) => user.attachments)
	@JoinColumn({ name: 'createdById' })
	createdBy: User;

	@Column()
	size: number;

	@Column()
	url: string;
}
