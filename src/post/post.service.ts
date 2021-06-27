import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PostType } from './dto/create-post.dto';
import { Post, PostDocument } from './post.schema';

@Injectable()
export class PostService {
	constructor(@InjectModel(Post.name) private postModel: Model<PostDocument>) {}

	async create(postType: PostType): Promise<Post> {
		const createdPost = new this.postModel(postType);
		return await createdPost.save();
	}

	async findAll(): Promise<Post[]> {
		return await this.postModel.find().exec();
	}
}
