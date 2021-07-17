import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Queue } from 'bull';
import { Model } from 'mongoose';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { AbstractService } from 'src/common/abstract.service';
import { Attachment, AttachmentDocument } from './attachment.schema';
import { cloudinary } from './cloudinary.config';

@Injectable()
export class AttachmentService extends AbstractService<
	AttachmentDocument,
	Attachment
> {
	constructor(
		@InjectQueue('uploadQueue')
		private readonly attachmentQueue: Queue,
		@InjectModel(Attachment.name)
		private readonly attachmentModel: Model<AttachmentDocument>,
		private readonly configService: ConfigService,
		private readonly cloudinaryService: CloudinaryService,
	) {
		super(attachmentModel);
	}

	getUrl(filename: string): string {
		return `${this.configService.get('host')}/${this.configService.get(
			'multer.servePath',
		)}/${filename}`;
	}
}
