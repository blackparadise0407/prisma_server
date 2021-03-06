import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import { BullModule } from '@nestjs/bull';
import { MailProcessor } from './mail.processor';
@Module({
	imports: [
		MailerModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => ({
				transport: {
					host: 'smtp.gmail.com',
					secure: true,
					auth: {
						user: configService.get<string>('gmail.username'),
						pass: configService.get<string>('gmail.password'),
					},
				},
				defaults: {
					from: `"No Reply" <${configService.get<string>('gmail.username')}>`,
				},
				template: {
					dir: join(__dirname, 'templates'),
					adapter: new HandlebarsAdapter(undefined, {
						inlineCssEnabled: true,
					}),
					options: {
						strict: true,
					},
				},
			}),
		}),
		BullModule.registerQueue({
			name: 'mailQueue',
		}),
		ConfigModule,
	],
	providers: [MailService, MailProcessor],
	exports: [MailService],
})
export class MailModule {}
