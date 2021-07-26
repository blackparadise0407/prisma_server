import { EntityRepository, Repository } from 'typeorm';
import { User } from './user.entity';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
	findByEmailOrGoogleId(email: string, googleId: string) {
		return this.createQueryBuilder('users')
			.where('email = :email', { email })
			.orWhere('googleId = :googleId', { googleId })
			.getOne();
	}
}
