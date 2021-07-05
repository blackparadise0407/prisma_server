import { CacheModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CachingService } from './caching.service';
import * as redisStore from 'cache-manager-redis-store';

@Module({
	imports: [
		CacheModule.registerAsync({
			imports: [ConfigModule],
			useFactory: (configService: ConfigService) => ({
				store: redisStore,
				host: configService.get<string>('redis.host'),
				port: configService.get<number>('redis.port'),
			}),
			inject: [ConfigService],
		}),
	],
	providers: [CachingService],
	exports: [CachingService],
})
export class CachingModule {}
