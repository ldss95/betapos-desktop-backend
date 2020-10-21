import { Model } from 'sequelize';

export interface CreditNoteProductAttr extends Model {
	id: string;
	creditNoteId: string;
	productId: number;
	quantity: number;
}
