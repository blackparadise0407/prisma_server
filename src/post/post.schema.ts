import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, SchemaTypes } from 'mongoose';
import { User } from 'src/user/user.schema';

export type PostDocument = Post & Document;

@Schema({ timestamps: true, versionKey: false })
export class Post {
	@Prop({ required: true })
	content: string;

	@Prop({ required: true, type: SchemaTypes.ObjectId, ref: 'User' })
	createdBy: Types.ObjectId;
}

export const PostSchema = SchemaFactory.createForClass(Post);
