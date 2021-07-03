import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';

export type ConfirmationDocument = Confirmation & Document;

@Schema({ versionKey: false })
export class Confirmation {
	@Prop({ required: true, index: true })
	code: string;

	@Prop({ required: true })
	expiredAt: Date;

	@Prop({ type: SchemaTypes.ObjectId, required: true, ref: 'User' })
	userId: Types.ObjectId;
}

export const ConfirmationSchema = SchemaFactory.createForClass(Confirmation);
