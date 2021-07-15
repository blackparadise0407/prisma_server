import { Query, Resolver } from '@nestjs/graphql';
import { PostType } from './dto/create-post.dto';
import { PostService } from './post.service';

@Resolver()
export class PostResolver {
	constructor(private readonly postService: PostService) {}
}
