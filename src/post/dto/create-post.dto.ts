import { ApiProperty } from '@nestjs/swagger';

export class PostCreateDTO {
	@ApiProperty()
	content: string;
}
