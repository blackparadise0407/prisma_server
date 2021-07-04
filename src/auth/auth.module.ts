import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { LoggerModule } from 'src/logger/logger.module';
import { LoggerService } from 'src/logger/logger.service';
import { MailModule } from 'src/mail/mail.module';
import { MailService } from 'src/mail/mail.service';
import { UserModule } from 'src/user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RefreshToken, RefreshTokenSchema } from './token/refresh-token.schema';
import { JwtStrategy } from './strategies/jwt-strategy';
import { TokenService } from './token/token.service';
import { ConfirmationService } from './confirmation/confirmation.service';
import {
	Confirmation,
	ConfirmationSchema,
} from './confirmation/confirmation.schema';
import {
	ResetPassword,
	ResetPasswordSchema,
} from './reset-password/reset-password.schema';
import { ResetPasswordService } from './reset-password/reset-password.service';

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
		forwardRef(() => UserModule),
	],
	controllers: [AuthController],
	providers: [
		AuthService,
		ConfigService,
		LoggerService,
		TokenService,
		JwtStrategy,
		MailService,
		ConfirmationService,
		ResetPasswordService,
	],
	exports: [AuthService, TokenService, ConfirmationService],
})
export class AuthModule {}
