export type UserStatus = 'VERIFIED' | 'PENDING' | 'DEACTIVATED';

export interface IUser {
	readonly username: string;
	readonly password: string;
	readonly email: string;
	readonly googleId: string;
	readonly facebookId: string;
	readonly status: UserStatus;
}
