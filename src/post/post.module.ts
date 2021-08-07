import { Module } from '@nestjs/common';
import { PostResolver } from './post.resolver';
import { Post } from './post.entity';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from 'src/logger/logger.module';
import { Photo } from './photo/photo.entity';

@Module({
	imports: [TypeOrmModule.forFeature([Post, Photo]), LoggerModule],
	controllers: [PostController],
	providers: [PostResolver, PostService],
})
export class PostModule {}
