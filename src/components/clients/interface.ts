import { Model } from 'sequelize'

export interface ClientAttr extends Model {
	id: string;
	name: string;
	dui: string;
	photoUrl: string;
	email: string;
	phone: string;
	address: string;
	hasCredit: boolean;
	createdAt: string;
	updatedAt: string;
}
