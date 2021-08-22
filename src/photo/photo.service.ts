import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/base.service';
import { LoggerService } from 'src/logger/logger.service';
import { Repository } from 'typeorm';
import { Photo } from './photo.entity';

@Injectable()
export class PhotoService extends BaseService<Photo, Repository<Photo>> {
	constructor(
		@InjectRepository(Photo) repository: Repository<Photo>,
		logger: LoggerService,
	) {
		super(repository, logger);
	}
}
