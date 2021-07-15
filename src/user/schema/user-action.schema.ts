import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';
import { EnumToArray } from 'src/utils/enum-to-array';

export enum ReactionEnum {
	like = 'LIKE',
	love = 'LOVE',
	angry = 'ANGRY',
	laugh = 'LAUGH',
	sad = 'SAD',
	care = 'CARE',
}

export type UserActionDocument = UserAction & Document;

@Schema({ versionKey: false, timestamps: true })
export class UserAction {
	@Prop({ required: true, type: SchemaTypes.ObjectId, ref: 'User' })
	userId: Types.ObjectId;

	@Prop({ enum: [...EnumToArray(ReactionEnum)] })
	reaction: string;

	@Prop()
	comment: string;

	@Prop()
	share: boolean;

	@Prop({ required: true, type: SchemaTypes.ObjectId, ref: 'Post' })
	postId: Types.ObjectId;
}

export const UserActionSchema = SchemaFactory.createForClass(UserAction);
