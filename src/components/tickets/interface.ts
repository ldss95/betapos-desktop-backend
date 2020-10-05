import { Model } from 'sequelize';

import { TicketProductAttr } from '../ticket-product/interface';

export interface TicketAttr extends Model {
	id?: string;
	ticketNumber: number | string;
	amount: number;
	status: 'IN PROCESS' | 'DONE' | 'PAUSED' | 'CANCELLED';
	TicketProducts?: TicketProductAttr[];
	createdAt?: string;
	updatedAt?: string;
}
