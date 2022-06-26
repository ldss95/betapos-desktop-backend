import { Model } from 'sequelize';

export interface ProductAttr extends Model {
	id: string;
	name: string;
	photoUrl: string;
	cost: number;
	price: number;
	itbis: boolean;
	isFractionable: boolean;
}

export interface BarcodeAttr extends Model {
	id: string;
	barcode: string;
	productId: string;
}
