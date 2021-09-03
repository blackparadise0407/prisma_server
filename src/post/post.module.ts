import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from 'src/logger/logger.module';
import { UserAction } from 'src/user/user-action/user-action.entity';
import { PostController } from './post.controller';
import { Post } from './post.entity';
import { PostRepository } from './post.repository';
import { PostService } from './post.service';

@Module({
	imports: [
		TypeOrmModule.forFeature([Post, UserAction, PostRepository]),
		LoggerModule,
	],
	controllers: [PostController],
	providers: [PostService],
	exports: [PostService],
})
export class PostModule {}
