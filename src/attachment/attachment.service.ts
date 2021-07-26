import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseService } from 'src/common/base.service';
import { LoggerService } from 'src/logger/logger.service';
import { Attachment } from './attachment.entity';
import { AttachmentRepository } from './attachment.repository';

@Injectable()
export class AttachmentService extends BaseService<
	Attachment,
	AttachmentRepository
> {
	constructor(
		repository: AttachmentRepository,
		logger: LoggerService,
		private readonly configService: ConfigService,
	) {
		super(repository, logger);
	}

	getUrl(filename: string): string {
		return `${this.configService.get('host')}/${this.configService.get(
			'multer.servePath',
		)}/${filename}`;
	}
}
