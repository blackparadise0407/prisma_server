import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttachmentModule } from 'src/attachment/attachment.module';
import { CachingModule } from 'src/caching/caching.module';
import { LoggerModule } from 'src/logger/logger.module';
import { MailModule } from 'src/mail/mail.module';
import { UserModule } from 'src/user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Confirmation } from './confirmation/confirmation.entity';
import { ConfirmationService } from './confirmation/confirmation.service';
import { JwtStrategy } from './strategies/jwt-strategy';
import { RefreshToken } from './token/refresh-token.entity';
import { TokenService } from './token/token.service';

@Module({
	imports: [
		TypeOrmModule.forFeature([Confirmation, RefreshToken]),
		LoggerModule,
		ConfigModule,
		MailModule,
		CachingModule,
		AttachmentModule,
		forwardRef(() => UserModule),
	],
	controllers: [AuthController],
	providers: [AuthService, TokenService, JwtStrategy, ConfirmationService],
	exports: [AuthService, TokenService, ConfirmationService],
})
export class AuthModule {}
