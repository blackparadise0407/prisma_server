import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, SchemaTypes } from 'mongoose';

export type ResetPasswordDocument = ResetPassword & Document;

@Schema({ versionKey: false })
export class ResetPassword {
	@Prop({ required: true, unique: true })
	code?: string;

	@Prop({ type: SchemaTypes.ObjectId, required: true, ref: 'User' })
	userId?: Types.ObjectId;

	@Prop({ required: true })
	expiredAt?: Date;
}

export const ResetPasswordSchema = SchemaFactory.createForClass(ResetPassword);
