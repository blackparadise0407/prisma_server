import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';
import { EnumToArray } from 'src/utils/enum-to-array';
import { ConfirmationEnum } from './confirmation.enum';
import { ConfirmationType } from './confirmation.interface';

export type ConfirmationDocument = Confirmation & Document;

@Schema({ versionKey: false })
export class Confirmation {
	@Prop({ required: true, index: true })
	code: string;

	@Prop({ required: true })
	expiredAt: Date;

	@Prop({ type: SchemaTypes.ObjectId, required: true, ref: 'User' })
	userId: Types.ObjectId;

	@Prop({ enum: [...EnumToArray(ConfirmationEnum)] })
	type: ConfirmationType;
}

export const ConfirmationSchema = SchemaFactory.createForClass(Confirmation);
