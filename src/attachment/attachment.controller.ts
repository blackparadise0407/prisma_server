import { InjectQueue } from '@nestjs/bull';
import {
	BadRequestException,
	Controller,
	HttpStatus,
	Post,
	Req,
	UploadedFile,
	UseGuards,
	UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import {
	ApiConsumes,
	ApiOperation,
	ApiResponse,
	ApiTags,
} from '@nestjs/swagger';
import { Queue } from 'bull';
import { plainToClass } from 'class-transformer';
import { Request } from 'express';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { ApiFile } from 'src/common/decorators/api-file.decorator';
import { User } from 'src/common/decorators/user.decorator';
import { GeneralResponse } from 'src/common/general-response';
import { Attachment, AttachmentType } from './attachment.entity';
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

	@UseGuards(AuthGuard('jwt'))
	@Post('image')
	@ApiConsumes('multipart/form-data')
	@ApiFile('file')
	@ApiResponse({ status: HttpStatus.OK })
	@ApiResponse({ status: HttpStatus.BAD_REQUEST, type: BadRequestException })
	@ApiOperation({
		summary: 'Upload attachment',
		description: 'Upload new attachment',
	})
	@UseInterceptors(FileInterceptor('file', multetOpts(AttachmentType.image)))
	async uploadImage(
		@User('id') userId: number,
		@Req() req: Request & { fileValidationError?: string },
		@UploadedFile() file: Express.Multer.File,
	) {
		if (req.fileValidationError) {
			throw new BadRequestException(req.fileValidationError);
		}

		const attachment = plainToClass(Attachment, {
			type: AttachmentType.image,
			size: file.size,
			url: this.attachmentService.getUrl(file.filename),
			createdById: userId,
		} as Attachment);
		await this.attachmentService.create(attachment);
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
