import { Model } from 'sequelize';

export interface ShiftAttr extends Model {
	id?: string;
	userId: number;
	startAmount: number;
	startTime?: string;
	endAmount?: number;
	endTime?: string;
	date?: string;
}
