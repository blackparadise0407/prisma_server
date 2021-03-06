import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { LoggerModule } from 'src/logger/logger.module';
import { AttachmentController } from './attachment.controller';
import { Attachment } from './attachment.entity';
import { AttachmentProcessor } from './attachment.processor';
import { AttachmentService } from './attachment.service';

@Module({
	imports: [
		TypeOrmModule.forFeature([Attachment]),
		BullModule.registerQueue({
			name: 'uploadQueue',
		}),
		CloudinaryModule,
		ConfigModule,
		LoggerModule,
	],
	controllers: [AttachmentController],
	providers: [AttachmentService, AttachmentProcessor],
	exports: [AttachmentService],
})
export class AttachmentModule {}
