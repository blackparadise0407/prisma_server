import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PostResolver } from './post.resolver';
import { Post, PostSchema } from './post.schema';
import { PostService } from './post.service';
import { PostController } from './post.controller';

@Module({
	imports: [
		MongooseModule.forFeatureAsync([
			{
				name: Post.name,
				useFactory: () => {
					const schema = PostSchema;
					schema.set('toJSON', {
						transform: (_, ret: { [key: string]: any }) => {
							ret.id = ret._id;
							delete ret._id;
						},
					});
					return schema;
				},
			},
		]),
	],
	controllers: [PostController],
	providers: [PostResolver, PostService],
})
export class PostModule {}
