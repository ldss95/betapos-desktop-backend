import { Model } from 'sequelize';

export interface CashFlowAttr extends Model {
	id?: string;
	type: 'IN' | 'OUT';
	amount: number;
	description: string;
	userId: number;
	shiftId: string;
	createdAt?: string;
	updatedAt?: string;
}
