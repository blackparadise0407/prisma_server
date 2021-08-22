import { Module } from '@nestjs/common';
import { PhotoService } from './photo.service';
import { PhotoController } from './photo.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Photo } from './photo.entity';
import { LoggerModule } from 'src/logger/logger.module';

@Module({
	imports: [TypeOrmModule.forFeature([Photo]), LoggerModule],
	controllers: [PhotoController],
	providers: [PhotoService],
	exports: [PhotoService],
})
export class PhotoModule {}
