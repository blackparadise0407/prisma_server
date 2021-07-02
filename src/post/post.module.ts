import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PostResolver } from './post.resolver';
import { Post, PostSchema } from './post.schema';
import { PostService } from './post.service';

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
	controllers: [],
	providers: [PostResolver, PostService],
})
export class PostModule {}
