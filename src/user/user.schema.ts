import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { EnumToArray } from 'src/utils/enum-to-array';
import { UserStatus } from './user.interface';

// const UserStatusEnum: UserStatus[] = ['VERIFIED', 'PENDING', 'DEACTIVATED'];

export enum UserStatusEnum {
	VERIFIED = 'VERIFIED',
	PENDING = 'PENDING',
	DEACTIVATED = 'DEACTIVATED',
}

export type UserDocument = User & Document;

@Schema({ versionKey: false, timestamps: true })
export class User {
	@Prop({ index: true })
	username: string;

	@Prop({ index: true })
	email: string;

	@Prop()
	password: string;

	@Prop()
	googleId: string;

	@Prop()
	facebookId: string;

	@Prop()
	avatar: string;

	@Prop({
		required: true,
		default: 'PENDING',
		enum: [...EnumToArray(UserStatusEnum)],
	})
	status: UserStatus;
}

export const UserSchema = SchemaFactory.createForClass(User);
