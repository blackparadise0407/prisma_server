export type UserStatus = 'VERIFIED' | 'PENDING' | 'DEACTIVATED';

export interface IUser {
	readonly firstName: string;
	readonly lastName: string;
	readonly password: string;
	readonly phoneNumber: string;
	readonly googleId: string;
	readonly facebookId: string;
	readonly status: UserStatus;
}
