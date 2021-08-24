import { ApiProperty } from '@nestjs/swagger';
import { GeneralQueryDTO } from 'src/common/dto/shared.dto';

export class PostCreateDTO {
	@ApiProperty()
	content: string;
}

export class GetCommentByPostDTO {
	@ApiProperty()
	postId: number;
}
