import { Model } from 'sequelize';

export interface UserAttr extends Model {
	id: number;
	name: string;
	nickName: string;
	password: string;
	dui: string;
	phone: string;
	birthday: string;
	role: string;
	tfa: boolean;
	tfaCode: string;
	isActive: boolean;
}
