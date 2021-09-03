import { BullModule } from '@nestjs/bull';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { AppGateway } from './app.gateway';
import { AttachmentModule } from './attachment/attachment.module';
import { AuthModule } from './auth/auth.module';
import { CachingModule } from './caching/caching.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { AppLoggerMiddleware } from './common/middlewares/logger.middleware';
import configuration from './config/configuration';
import connectionOptions from './config/orm.config';
import { LoggerModule } from './logger/logger.module';
import { MailModule } from './mail/mail.module';
import { PhotoModule } from './photo/photo.module';
import { PostGateway } from './post/post.gateway';
import { PostModule } from './post/post.module';
import { ProfileModule } from './profile/profile.module';
import { TaskService } from './task/task.service';
import { UserModule } from './user/user.module';
@Module({
	imports: [
		ConfigModule.forRoot({
			envFilePath: ['.env', '.prod.env'],
			load: [configuration],
		}),
		TypeOrmModule.forRoot(connectionOptions),
		BullModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: (configService: ConfigService) => ({
				redis: {
					host: configService.get('redis.host'),
					port: configService.get<number>('redis.port'),
				},
			}),
			inject: [ConfigService],
		}),
		ServeStaticModule.forRoot({
			rootPath: join(__dirname, '..', 'public'),
			serveRoot: '/public',
		}),
		ScheduleModule.forRoot(),
		UserModule,
		PostModule,
		AuthModule,
		LoggerModule,
		MailModule,
		CachingModule,
		AttachmentModule,
		CloudinaryModule,
		ProfileModule,
		PhotoModule,
	],
	providers: [AppGateway, PostGateway, TaskService],
})
export class AppModule implements NestModule {
	static isDev: boolean;
	static port: number;
	constructor(private readonly configService: ConfigService) {
		AppModule.port = this.configService.get<number>('port');
		AppModule.isDev = process.env.NODE_ENV === 'development';
	}
	configure(consumer: MiddlewareConsumer): void {
		consumer.apply(AppLoggerMiddleware).forRoutes('*');
	}
}
