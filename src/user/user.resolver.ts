import { Query, Resolver } from '@nestjs/graphql';
import { UserType } from './dto/user-type.dto';
import { UserService } from './user.service';

@Resolver()
export class UserResolver {
	constructor(private readonly userService: UserService) {}
	@Query(() => [UserType])
	async users() {
		return this.userService.findAll();
	}
}
