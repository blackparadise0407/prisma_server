import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserStatus } from './user.interface';

const UserStatusEnum: UserStatus[] = ['VERIFIED', 'PENDING', 'DEACTIVATED'];

export type UserDocument = User & Document;

@Schema({ versionKey: false, timestamps: true })
export class User {
	@Prop()
	firstName: string;

	@Prop()
	lastName: string;

	@Prop()
	password: string;

	@Prop()
	googleId: string;

	@Prop()
	facebookId: string;

	@Prop({ required: true, default: 'PENDING', enum: [...UserStatusEnum] })
	status: string;

	@Prop()
	phoneNumber: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
