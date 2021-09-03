import { EntityRepository, Repository } from 'typeorm';
import { User } from './user.entity';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
	findByEmailOrGoogleId(email: string, googleId: string) {
		return this.createQueryBuilder('user')
			.leftJoinAndSelect('user.avatar', 'attachments')
			.where('user.email = :email', { email })
			.orWhere('user.googleId = :googleId', { googleId })
			.getOne();
	}
}
