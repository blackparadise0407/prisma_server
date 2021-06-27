import { IUser } from 'src/user/user.interface';

export interface IPost {
	readonly content: string;
	readonly created_by: IUser;
}
