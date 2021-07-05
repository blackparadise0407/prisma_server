import { Types } from 'mongoose';

export type ConfirmationType = 'CONFIRMATION' | 'FORGET_PASSWORD';
export interface IConfirmation {
	userId?: Types.ObjectId;
	code?: string;
	type?: ConfirmationType;
}
