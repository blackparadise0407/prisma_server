import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { BaseService } from 'src/common/base.service';
import { LoggerService } from 'src/logger/logger.service';
import { User } from './entities/user.entity';
import { UserRepository } from './repositories/user.repository';

@Injectable()
export class UserService extends BaseService<User, UserRepository> {
	constructor(repository: UserRepository, logger: LoggerService) {
		super(repository, logger);
	}

	comparePassword(str: string, hashedString: string): Promise<boolean> {
		return bcrypt.compare(str, hashedString);
	}
}
