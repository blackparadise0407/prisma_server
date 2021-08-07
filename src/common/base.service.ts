import { InternalServerErrorException } from '@nestjs/common';
import { LoggerService } from 'src/logger/logger.service';
import {
	BaseEntity,
	FindConditions,
	FindManyOptions,
	FindOneOptions,
	Repository,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { EntityId } from 'typeorm/repository/EntityId';

export class BaseService<T extends BaseEntity, R extends Repository<T>> {
	protected readonly logger: LoggerService;
	protected readonly repository: R;
	constructor(repository: R, logger: LoggerService) {
		this.repository = repository;
		this.logger = logger;
	}

	findAll(opt: FindManyOptions = {}): Promise<T[]> {
		try {
			return this.repository.find(opt);
		} catch (e) {
			this.logger.error(e.message);
			throw new InternalServerErrorException();
		}
	}

	findOne(id: EntityId, opt: FindOneOptions<T> = {}): Promise<T> {
		try {
			return this.repository.findOne(id, opt);
		} catch (e) {
			this.logger.error(e.message);
			throw new InternalServerErrorException();
		}
	}

	findById(id: EntityId): Promise<T> {
		try {
			return this.repository.findOne(id);
		} catch (e) {
			this.logger.error(e.message);
			throw new InternalServerErrorException();
		}
	}

	create(data: any): Promise<T> {
		try {
			return this.repository.save(data);
		} catch (e) {
			this.logger.error(e.message);
			throw new InternalServerErrorException();
		}
	}

	async update(
		crit: EntityId | FindConditions<T>,
		data: QueryDeepPartialEntity<T>,
	): Promise<T> {
		try {
			await this.repository.update(crit, data);
			return this.repository.findOne(crit as EntityId);
		} catch (e) {
			this.logger.error(e.message);
			throw new InternalServerErrorException();
		}
	}

	async delete(crit: EntityId | FindConditions<T> | any): Promise<boolean> {
		const result = await this.repository.delete(crit);
		if (result.affected > 0) {
			return true;
		} else {
			this.logger.error(result.raw);
			return false;
		}
	}
}
