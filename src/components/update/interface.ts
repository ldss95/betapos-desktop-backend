import { Model } from 'sequelize';

export interface UpdatesAttr extends Model {
	table: string;
	date: string;
}