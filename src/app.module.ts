import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration from './config/configuration';
import { AppLoggerMiddleware } from './middlewares/logger.middleware';
import { PostModule } from './post/post.module';
import { UserModule } from './user/user.module';
import { RefreshTokenModule } from './refresh-token/refresh-token.module';
import { AuthModule } from './auth/auth.module';
import { LoggerModule } from './logger/logger.module';

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
			}),
			inject: [ConfigService],
		}),
		UserModule,
		PostModule,
		RefreshTokenModule,
		AuthModule,
		LoggerModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule implements NestModule {
	configure(consumer: MiddlewareConsumer): void {
		consumer.apply(AppLoggerMiddleware).forRoutes('*');
	}
}
// export class AppModule {}
