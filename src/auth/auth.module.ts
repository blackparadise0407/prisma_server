import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CachingModule } from 'src/caching/caching.module';
import { LoggerModule } from 'src/logger/logger.module';
import { MailModule } from 'src/mail/mail.module';
import { UserModule } from 'src/user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Confirmation } from './confirmation/confirmation.entity';
import { ConfirmationService } from './confirmation/confirmation.service';
import { JwtStrategy } from './strategies/jwt-strategy';
import { TokenService } from './token/token.service';

@Module({
	imports: [
		LoggerModule,
		TypeOrmModule.forFeature([Confirmation]),
		ConfigModule,
		MailModule,
		CachingModule,
		forwardRef(() => UserModule),
	],
	controllers: [AuthController],
	providers: [AuthService, TokenService, JwtStrategy, ConfirmationService],
	exports: [AuthService, TokenService, ConfirmationService],
})
export class AuthModule {}
