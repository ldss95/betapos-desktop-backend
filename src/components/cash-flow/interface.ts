import { Model } from 'sequelize';

export interface CashFlowAttr extends Model {
	id?: string;
	type: 'IN' | 'OUT' | 'CHECK';
	amount: number;
	description: string;
	cashDetail: { amount: number, quantity: number }[];
	userId: number;
	shiftId: string;
	createdAt?: string;
	updatedAt?: string;
}
