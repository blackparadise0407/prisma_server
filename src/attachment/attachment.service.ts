import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Queue } from 'bull';
import { Model } from 'mongoose';
import { AbstractService } from 'src/common/abstract.service';
import { Attachment, AttachmentDocument } from './attachment.schema';

@Injectable()
export class AttachmentService extends AbstractService<AttachmentDocument> {
	constructor(
		@InjectModel(Attachment.name)
		private readonly attachmentModel: Model<AttachmentDocument>,
		@InjectQueue('attachment') private readonly attachmentQueue: Queue,
	) {
		super(attachmentModel);
	}
}
