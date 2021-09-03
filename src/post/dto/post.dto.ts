import { ApiProperty } from '@nestjs/swagger';

export class PostCreateDTO {
	@ApiProperty()
	content: string;
}

export class GetCommentByPostDTO {
	@ApiProperty()
	postId: number;
}
