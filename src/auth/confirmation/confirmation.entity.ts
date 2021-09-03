import { User } from 'src/user/user.entity';
import {
	BaseEntity,
	Column,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
} from 'typeorm';

export enum ConfirmationType {
	emailConfirm = 'EMAIL_CONFIRM',
	forgetPassword = 'FORGET_PASSWORD',
	resetPassword = 'RESET_PASSWORD',
}

@Entity('confirmations')
export class Confirmation extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ unique: true })
	code: string;

	@Column({ type: 'timestamptz' })
	expiredAt: Date;

	@Column()
	userId: string;

	@ManyToOne(() => User, (user) => user.confirmation)
	@JoinColumn({ name: 'userId' })
	user: User;

	@Column({ type: 'enum', enum: ConfirmationType })
	type: ConfirmationType;
}
