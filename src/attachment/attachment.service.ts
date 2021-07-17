import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Queue } from 'bull';
import { Model } from 'mongoose';
import { AbstractService } from 'src/common/abstract.service';
import { Attachment, AttachmentDocument } from './attachment.schema';

@Injectable()
export class AttachmentService extends AbstractService<AttachmentDocument> {
	constructor(
		@InjectQueue('uploadQueue')
		private readonly attachmentQueue: Queue,
		@InjectModel(Attachment.name)
		private readonly attachmentModel: Model<AttachmentDocument>,
		private readonly configService: ConfigService,
	) {
		super(attachmentModel);
	}
}
