import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/common/base.service';
import { LoggerService } from 'src/logger/logger.service';
import { Profile } from './profile.entity';
import { ProfileRepository } from './profile.repository';

@Injectable()
export class ProfileService extends BaseService<Profile, ProfileRepository> {
	constructor(repository: ProfileRepository, logger: LoggerService) {
		super(repository, logger);
	}
}
