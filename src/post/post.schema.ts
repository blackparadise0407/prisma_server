import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from 'src/user/user.schema';

export type PostDocument = Post & Document;

@Schema({ timestamps: true, versionKey: false })
export class Post {
	@Prop({ required: true })
	content: string;

	@Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'User' })
	created_by: User;
}

export const PostSchema = SchemaFactory.createForClass(Post);
