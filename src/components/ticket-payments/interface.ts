import { Model } from 'sequelize'

export interface TicketPaymentAttr extends Model {
	id: string;
	ticketId: string;
	typeId: string;
	amount: number;
	createdAt: string;
	updatedAt: string;
}
