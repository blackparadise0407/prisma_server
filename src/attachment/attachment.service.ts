import { InjectQueue } from '@nestjs/bull';
import { Injectable, UseInterceptors } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Queue } from 'bull';
import { Model } from 'mongoose';
import { diskStorage } from 'multer';
import { AbstractService } from 'src/common/abstract.service';
import { Attachment, AttachmentDocument } from './attachment.schema';

@Injectable()
export class AttachmentService extends AbstractService<AttachmentDocument> {
	private multerConfig;
	constructor(
		@InjectModel(Attachment.name)
		@InjectQueue('attachment')
		private readonly attachmentQueue: Queue,
		private readonly attachmentModel: Model<AttachmentDocument>,
		private readonly configService: ConfigService,
	) {
		super(attachmentModel);
		this.multerConfig = this.configService.get('multer');
	}

	@UseInterceptors(
		FilesInterceptor('image', 1, {
			storage: diskStorage({
				destination: './upload/images',
				filename: (_, file, cb) => {
					const filename = Date.now() + file.originalname;
					cb(null, filename);
				},
			}),
			// fileFilter: (_, file, cb) => {
			//     if([])
			// },
			// limits: {
			// 	fileSize: config.multer.image.limit,
			// },
		}),
	)
	async uploadSingleImage() {}
}
