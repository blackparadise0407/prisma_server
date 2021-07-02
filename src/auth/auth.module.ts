import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { LoggerModule } from 'src/logger/logger.module';
import { LoggerService } from 'src/logger/logger.service';
import { UserModule } from 'src/user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RefreshToken, RefreshTokenSchema } from './refresh-token.schema';
import { JwtStrategy } from './strategies/jwt-strategy';
import { TokenService } from './token/token.service';

@Module({
	imports: [
		LoggerModule,
		MongooseModule.forFeatureAsync([
			{
				name: RefreshToken.name,
				useFactory: () => {
					const schema = RefreshTokenSchema;
					schema.set('toJSON', {
						transform: (_, ret: { [key: string]: any }) => {
							ret.id = ret._id;
							delete ret._id;
						},
					});
					return schema;
				},
			},
		]),
		ConfigModule,
		UserModule,
	],
	controllers: [AuthController],
	providers: [
		AuthService,
		ConfigService,
		LoggerService,
		TokenService,
		JwtStrategy,
	],
	exports: [AuthService, TokenService],
})
export class AuthModule {}
