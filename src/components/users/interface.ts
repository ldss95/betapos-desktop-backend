import { Model } from 'sequelize';

export interface UserAttr extends Model {
	id: string;
	firstName: string;
	lastName: string;
	email?: string;
	nickName?: string;
	password: string;
	dui: string;
	phone: string;
	photoUrl: string;
	birthday: string;
	role: string;
	tfa: boolean;
	tfaCode: string;
	isActive: boolean;
}
