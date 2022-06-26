import { Model } from 'sequelize';

export interface TicketProductAttr extends Model {
	ticketId: string;
	productId: string;
	quantity: number;
	cost: number;
	price: number;
}
