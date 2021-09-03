import { OnQueueFailed, Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import * as fs from 'fs';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { AttachmentType } from './attachment.entity';
import { AttachmentService } from './attachment.service';

@Processor('uploadQueue')
export class AttachmentProcessor {
	private logger = new Logger('Upload');
	constructor(
		private readonly cloudinaryService: CloudinaryService,
		private readonly attachmentService: AttachmentService,
	) {}

	@OnQueueFailed()
	onError(job: Job<any>, error: any) {
		this.logger.error(
			`Failed job ${job.id} of type ${job.name}: ${error.message}`,
			error.stack,
		);
	}

	@Process('imageUpload')
	async uploadImage(
		job: Job<{ id: number; path: string; name: string }>,
	): Promise<any> {
		const { id, path, name } = job.data;
		try {
			const url = await this.cloudinaryService.uploadSingle({
				path,
				name,
				type: AttachmentType.image,
			});
			await this.attachmentService.update(id, { url });
			fs.unlinkSync(path);
		} catch (e) {
			throw e;
		}
	}
}
