import { Model } from 'sequelize';

import { TicketProductAttr } from '../ticket-products/interface';
import { TicketPaymentAttr } from '../ticket-payments/interface';
import { ClientAttr } from '../clients/interface';
import { UserAttr } from '../users/interface';
import { TicketPaymentTypeAttr } from '../ticket-payments-types/interface';

export interface TicketAttr extends Model {
	id?: string;
	ticketNumber: number | string;
	clientId?: string;
	client: ClientAttr;
	userId: string;
	seller: UserAttr;
	discount: number;
	amount: number;
	status: 'IN PROCESS' | 'DONE' | 'PAUSED' | 'CANCELLED';
	products?: TicketProductAttr[];
	payments: TicketPaymentAttr[];
	paymentTypeId: string;
	paymentType: TicketPaymentTypeAttr;
	orderType: 'DELIVERY' | 'PICKUP';
	shippingAddress?: string;
	cashReceived?: number;
	createdAt?: string;
	updatedAt?: string;
}
