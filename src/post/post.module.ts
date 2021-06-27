import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PostResolver } from './post.resolver';
import { Post, PostSchema } from './post.schema';
import { PostService } from './post.service';

@Module({
	imports: [
		MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
	],
	controllers: [],
	providers: [PostResolver, PostService],
})
export class PostModule {}
