import { Model } from 'sequelize';

export interface TicketProductAttr extends Model {
	ticketId: string;
	productId: number;
	quantity: number;
	price: number;
	createdAt?: string;
	updatedAt?: string;
}
