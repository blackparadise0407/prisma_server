import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PostType {
	@Field(() => String)
	content: string;

	@Field()
	created_by: string;
}
