import { Module } from '@nestjs/common';

import { Post } from './post.entity';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from 'src/logger/logger.module';
import { Photo } from './photo/photo.entity';
import { PostRepository } from './post.repository';

@Module({
	imports: [
		TypeOrmModule.forFeature([Post, Photo, PostRepository]),
		LoggerModule,
	],
	controllers: [PostController],
	providers: [PostService],
	exports: [PostService],
})
export class PostModule {}
