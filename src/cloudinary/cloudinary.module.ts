import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { v2 } from 'cloudinary';
import { CloudinaryService } from './cloudinary.service';

@Module({
	imports: [ConfigModule],
	providers: [
		{
			provide: 'Cloudinary',
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => {
				return v2.config({
					cloud_name: configService.get('cloudinary.name'),
					api_key: configService.get('cloudinary.key'),
					api_secret: configService.get('cloudinary.secret'),
					secure: true,
				});
			},
		},
		CloudinaryService,
	],
	exports: [CloudinaryService],
})
export class CloudinaryModule {}
