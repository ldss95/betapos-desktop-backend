import { Model } from 'sequelize';

export interface UserAttr extends Model {
	id: string;
	name: string;
	email?: string;
	nickName?: string;
	password: string;
	dui: string;
	phone: string;
	birthday: string;
	role: string;
	tfa: boolean;
	tfaCode: string;
	isActive: boolean;
}
