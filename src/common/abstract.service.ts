import { InternalServerErrorException } from '@nestjs/common';
import { Document, FilterQuery, Model, Types } from 'mongoose';
import { LoggerService } from 'src/logger/logger.service';

export abstract class AbstractService<T extends Document> {
	private readonly _model: Model<T>;
	private readonly serviceLogger: LoggerService;

	constructor(model?: Model<T>) {
		if (model) {
			this._model = model;
			this.serviceLogger = new LoggerService(model.collection.name, true);
		}
	}

	async findAll(filter: FilterQuery<T> = {}): Promise<T[]> {
		try {
			this.serviceLogger.log('OK');
			return this._model.find(filter).exec();
		} catch (e) {
			this.serviceLogger.error(e);
			throw new InternalServerErrorException();
		}
	}

	async findById(id: string): Promise<T> {
		try {
			return this._model.findById(Types.ObjectId(id)).exec();
		} catch (e) {
			this.serviceLogger.error(e);
			throw new InternalServerErrorException();
		}
	}

	async create(payload: T): Promise<T> {
		try {
			const record = new this._model(payload);
			await record.save();
			return record;
		} catch (e) {
			this.serviceLogger.error(e);
			throw new InternalServerErrorException();
		}
	}

	async findOne(filter: FilterQuery<T>): Promise<T> {
		try {
			return this._model.findOne(filter);
		} catch (e) {
			this.serviceLogger.error(e);
			throw new InternalServerErrorException();
		}
	}

	async deleteById(id: string): Promise<T> {
		try {
			return this._model.findByIdAndDelete(Types.ObjectId(id));
		} catch (e) {
			this.serviceLogger.error(e);
			throw new InternalServerErrorException();
		}
	}
}
