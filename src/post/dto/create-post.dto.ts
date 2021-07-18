import { Field, ObjectType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';

@ObjectType()
export class PostType {
	@Field(() => String)
	content: string;

	@Field()
	created_by: string;
}

export class PostCreateDTO {
	@ApiProperty()
	content: string;

	@ApiProperty()
	photos: Types.ObjectId[];
}
