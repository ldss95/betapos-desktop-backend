import { Model } from 'sequelize';

import { TicketProductAttr } from '../ticket-products/interface';
import { TicketPaymentAttr } from '../ticket-payments/interface';

export interface TicketAttr extends Model {
	id?: string;
	ticketNumber: number | string;
	clientId?: string;
	amount: number;
	status: 'IN PROCESS' | 'DONE' | 'PAUSED' | 'CANCELLED';
	products?: TicketProductAttr[];
	payments: TicketPaymentAttr[];
	paymentTypeId: string;
	orderType: 'DELIVERY' | 'PICKUP';
	shippingAddress?: string;
	createdAt?: string;
	updatedAt?: string;
}
