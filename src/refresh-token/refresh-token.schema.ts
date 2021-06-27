import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from 'src/user/user.schema';

export type RefreshTokenDocument = RefreshToken & Document;

@Schema({ timestamps: true, versionKey: false })
export class RefreshToken {
	@Prop({ required: true, unique: true })
	value: string;

	@Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'User' })
	user: User;

	@Prop({ required: true })
	ipAddress: string;

	@Prop({ required: true })
	expiredAt: Date;
}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);
