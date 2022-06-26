import { Model } from 'sequelize'

export interface TicketPaymentTypeAttr extends Model {
	id: string;
	name: string;
	description: string;
	createdAt: string;
	updatedAt: string;
}
