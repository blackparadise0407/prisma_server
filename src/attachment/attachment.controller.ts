import { InjectQueue } from '@nestjs/bull';
import {
	BadRequestException,
	Controller,
	Post,
	Req,
	UploadedFile,
	UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { Queue } from 'bull';
import { Request } from 'express';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { GeneralResponse } from 'src/common/responses/general-response';
import { AttachmentType } from './attachment.entity';
import { AttachmentService } from './attachment.service';
import { multetOpts } from './multer.config';

@ApiTags('attachment')
@Controller('attachment')
export class AttachmentController {
	constructor(
		private readonly attachmentService: AttachmentService,
		@InjectQueue('uploadQueue') private uploadQueue: Queue,
		private readonly cloudinaryService: CloudinaryService,
	) {}

	@Post('image')
	@UseInterceptors(FileInterceptor('file', multetOpts('IMAGE')))
	async uploadImage(
		@Req() req: Request & { fileValidationError?: string },
		@UploadedFile() file: Express.Multer.File,
	) {
		if (req.fileValidationError) {
			throw new BadRequestException(req.fileValidationError);
		}
		const attachment = await this.attachmentService.create({
			type: AttachmentType.image,
			size: file.size,
			url: this.attachmentService.getUrl(file.filename),
		});
		await this.uploadQueue.add('imageUpload', {
			id: attachment.id,
			path: file.path,
			name: file.filename,
		});
		return new GeneralResponse({
			data: attachment,
		});
	}
}
