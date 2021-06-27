import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UserType {
	@Field()
	email: string;
}
