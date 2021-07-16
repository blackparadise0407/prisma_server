import {
	Controller,
	Post,
	UploadedFile,
	UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { AttachmentService } from './attachment.service';

@ApiTags('attachment')
@Controller('attachment')
export class AttachmentController {
	constructor(private readonly attachmentService: AttachmentService) {}

	@Post('image')
	@UseInterceptors(FileInterceptor('image'))
	async uploadImage(@UploadedFile() image: Express.Multer.File) {
		console.log(image);
	}
}
