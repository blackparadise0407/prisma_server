import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AbstractService } from 'src/common/abstract.service';
import { Post, PostDocument } from './post.schema';

@Injectable()
export class PostService extends AbstractService<PostDocument, Post> {
	constructor(@InjectModel(Post.name) private postModel: Model<PostDocument>) {
		super(postModel);
	}
}
