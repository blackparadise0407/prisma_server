import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, SchemaTypes } from 'mongoose';

export type RefreshTokenDocument = RefreshToken & Document;

@Schema({ timestamps: true, versionKey: false })
export class RefreshToken {
	@Prop({ required: true, unique: true })
	value: string;

	@Prop({ type: SchemaTypes.ObjectId, required: true, ref: 'User' })
	user: Types.ObjectId;

	@Prop()
	ipAddress: string;

	@Prop({ required: true })
	expiredAt: Date;
}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);
