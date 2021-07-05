import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache, CachingConfig } from 'cache-manager';

@Injectable()
export class CachingService {
	constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

	async set(
		key: string,
		value: any,
		opts: CachingConfig = { ttl: 60 * 5 },
	): Promise<void> {
		await this.cacheManager.set(key, value, opts);
	}

	async get<T>(key: string): Promise<T> {
		try {
			return (await this.cacheManager.get(key)) as T;
		} catch (e) {
			return null;
		}
	}

	async delete(key: string): Promise<boolean> {
		try {
			await this.cacheManager.del(key);
			return true;
		} catch (e) {
			return false;
		}
	}
}
