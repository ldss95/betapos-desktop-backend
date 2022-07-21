import { Model } from 'sequelize'
import { TicketPaymentTypeAttr } from '../ticket-payments-types/interface';

export interface TicketPaymentAttr extends Model {
	id: string;
	ticketId: string;
	typeId: string;
	type: TicketPaymentTypeAttr;
	amount: number;
	createdAt: string;
	updatedAt: string;
}
