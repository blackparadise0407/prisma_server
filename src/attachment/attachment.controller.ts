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
import { Request } from 'express';
import { AttachmentService } from './attachment.service';
import { multetOpts } from './multer.config';

@ApiTags('attachment')
@Controller('attachment')
export class AttachmentController {
	constructor(private readonly attachmentService: AttachmentService) {}

	@Post('image')
	@UseInterceptors(FileInterceptor('file', multetOpts('IMAGE')))
	async uploadImage(
		@Req() req: Request & { fileValidationError?: string },
		@UploadedFile() file: Express.Multer.File,
	) {
		if (req.fileValidationError) {
			throw new BadRequestException(req.fileValidationError);
		}
		console.log(file);
	}
}
