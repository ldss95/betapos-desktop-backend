import { Model } from 'sequelize';

export interface ProductAttr extends Model {
	id: number;
	name: string;
	photoUrl: string;
	price: number;
}

export interface BarcodeAttr extends Model {
	id: string;
	barcode: string;
	productId: number;
}
