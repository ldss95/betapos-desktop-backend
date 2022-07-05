import { Model } from 'sequelize';
import { UserAttr } from '../users/interface';

export interface ShiftAttr extends Model {
	id?: string;
	userId: string;
	user: UserAttr;
	startAmount: number;
	startTime?: string;
	endAmount?: number;
	cashDetails: { type: number, quantity: number }[];
	endTime?: string;
	date?: string;
}
