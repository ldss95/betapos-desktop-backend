import { Model } from 'sequelize';

import { CreditNoteProductAttr } from '../credit-note-products/interface'

export interface CreditNoteAttr extends Model {
	id: string;
	ticketId: string;
	amount: number;
	description: string;
	products: CreditNoteProductAttr[];
	status: 'USED' | 'UNUSED';
	createdAt: string;
	updatedAt: string;
}
