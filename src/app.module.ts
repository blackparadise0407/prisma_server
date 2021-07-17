import { BullModule } from '@nestjs/bull';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AttachmentModule } from './attachment/attachment.module';
import { AuthModule } from './auth/auth.module';
import { CachingModule } from './caching/caching.module';
import { AppLoggerMiddleware } from './common/middlewares/logger.middleware';
import configuration from './config/configuration';
import { LoggerModule } from './logger/logger.module';
import { MailModule } from './mail/mail.module';
import { PostModule } from './post/post.module';
import { TaskService } from './task/task.service';
import { UserModule } from './user/user.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			envFilePath: ['.env', '.prod.env'],
			load: [configuration],
		}),
		GraphQLModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: async (configService: ConfigService) => ({
				debug: false,
				playground: true,
				autoSchemaFile: 'schema.gql',
				cors: {
					origin: configService.get<string>('cors.origin'),
					credentials: true,
				},
			}),
		}),
		MongooseModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: async (configService: ConfigService) => ({
				uri: configService.get<string>('database.uri'),
				useNewUrlParser: true,
				useFindAndModify: false,
				useUnifiedTopology: true,
				useCreateIndex: true,
			}),
			inject: [ConfigService],
		}),
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
	],
	controllers: [AppController],
	providers: [AppService, TaskService],
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
// export class AppModule {}
