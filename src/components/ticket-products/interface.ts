import { Model } from 'sequelize';
import { ProductAttr } from '../products/interface';

export interface TicketProductAttr extends Model {
	ticketId: string;
	productId: string;
	product: ProductAttr;
	quantity: number;
	cost: number;
	price: number;
}
