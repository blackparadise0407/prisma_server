import { InternalServerErrorException } from '@nestjs/common';
import { Document, Model, Types } from 'mongoose';
import { LoggerService } from 'src/logger/logger.service';
import { CreateUserDTO } from 'src/user/dto/create-user.dto';

export abstract class AbstractService<T extends Document> {
	private readonly _model: Model<T>;
	private readonly serviceLogger: LoggerService;

	constructor(logger: LoggerService, model?: Model<T>) {
		this._model = model;
		this.serviceLogger = logger;
	}

	async findAll(filter = {}): Promise<T[]> {
		try {
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

	async create(payload: CreateUserDTO): Promise<T> {
		try {
			const user = new this._model(payload);
			await user.save();
			return user;
		} catch (e) {
			this.serviceLogger.error(e);
			throw new InternalServerErrorException();
		}
	}

	async findOne(filter = {}): Promise<T> {
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
