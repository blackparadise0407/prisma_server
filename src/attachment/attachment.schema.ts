import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';
import { EnumToArray } from 'src/utils/enum-to-array';

export type AttachmentDocument = Attachment & Document;

export enum AttachmentTypeEnum {
	image = 'IMAGE',
	video = 'VIDEO',
	file = 'FILE',
}

export type AttachmentType = 'IMAGE' | 'VIDEO' | 'FILE';

@Schema({ versionKey: false, timestamps: true })
export class Attachment {
	@Prop({ enum: [...EnumToArray(AttachmentTypeEnum)] })
	type: string;

	@Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
	userId: Types.ObjectId;

	@Prop({ type: SchemaTypes.ObjectId, ref: 'Post' })
	postId: Types.ObjectId;

	@Prop({ required: true })
	size: number;

	@Prop({ required: true })
	url: string;
}

export const AttachmentSchema = SchemaFactory.createForClass(Attachment);
