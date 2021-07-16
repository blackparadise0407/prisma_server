import { Module } from '@nestjs/common';
import { AttachmentService } from './attachment.service';
import { AttachmentController } from './attachment.controller';
import { BullModule } from '@nestjs/bull';
import { MongooseModule } from '@nestjs/mongoose';
import { Attachment, AttachmentSchema } from './attachment.schema';
import { MulterModule } from '@nestjs/platform-express';

@Module({
	imports: [
		BullModule.registerQueue({
			name: 'attachment',
		}),
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
		MulterModule.register({
			dest: './public/images',
		}),
	],
	controllers: [AttachmentController],
	providers: [AttachmentService],
})
export class AttachmentModule {}
