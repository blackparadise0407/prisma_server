import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { LoggerModule } from 'src/logger/logger.module';
import { MailModule } from 'src/mail/mail.module';
import { UserController } from './user.controller';
import { User } from './user.entity';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';
@Module({
	imports: [
		TypeOrmModule.forFeature([User, UserRepository]),
		LoggerModule,
		MailModule,
		ConfigModule,
		forwardRef(() => AuthModule),
	],
	providers: [UserService],
	exports: [UserService],
	controllers: [UserController],
})
export class UserModule {}
