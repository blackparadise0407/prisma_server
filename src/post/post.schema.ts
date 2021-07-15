import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';

export type PostDocument = Post & Document;

@Schema({ timestamps: true, versionKey: false })
export class Post {
	@Prop({ required: true })
	content: string;

	@Prop({ required: true, type: SchemaTypes.ObjectId, ref: 'User' })
	userId: Types.ObjectId;

	@Prop({ type: [SchemaTypes.ObjectId], ref: 'Attachment' })
	photos: Types.ObjectId[];
}

export const PostSchema = SchemaFactory.createForClass(Post);
