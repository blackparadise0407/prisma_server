import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { CachingModule } from 'src/caching/caching.module';
import { LoggerModule } from 'src/logger/logger.module';
import { MailModule } from 'src/mail/mail.module';
import { UserModule } from 'src/user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import {
	Confirmation,
	ConfirmationSchema,
} from './confirmation/confirmation.schema';
import { ConfirmationService } from './confirmation/confirmation.service';
import {
	ResetPassword,
	ResetPasswordSchema,
} from './reset-password/reset-password.schema';
import { ResetPasswordService } from './reset-password/reset-password.service';
import { JwtStrategy } from './strategies/jwt-strategy';
import { RefreshToken, RefreshTokenSchema } from './token/refresh-token.schema';
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
			{
				name: Confirmation.name,
				useFactory: () => {
					const schema = ConfirmationSchema;
					schema.set('toJSON', {
						transform: (_, ret: { [key: string]: any }) => {
							ret.id = ret._id;
							delete ret._id;
						},
					});
					return schema;
				},
			},
			{
				name: ResetPassword.name,
				useFactory: () => {
					const schema = ResetPasswordSchema;
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
		MailModule,
		CachingModule,
		forwardRef(() => UserModule),
	],
	controllers: [AuthController],
	providers: [
		AuthService,
		TokenService,
		JwtStrategy,
		ConfirmationService,
		ResetPasswordService,
	],
	exports: [AuthService, TokenService, ConfirmationService],
})
export class AuthModule {}
