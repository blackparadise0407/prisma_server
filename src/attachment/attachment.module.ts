import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AttachmentController } from './attachment.controller';
import { Attachment, AttachmentSchema } from './attachment.schema';
import { AttachmentService } from './attachment.service';

@Module({
	imports: [
		MongooseModule.forFeatureAsync([
			{
				name: Attachment.name,
				useFactory: () => {
					const schema = AttachmentSchema;
					schema.set('toJSON', {
						transform: (_, ret: { [key: string]: any }) => {
							ret.id = ret._id;
							delete ret._id;
						},
					});
					return schema;
				},
			},
		]),
		BullModule.registerQueue({
			name: 'uploadQueue',
		}),
		ConfigModule,
	],
	controllers: [AttachmentController],
	providers: [AttachmentService],
})
export class AttachmentModule {}
