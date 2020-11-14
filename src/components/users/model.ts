import { DataTypes } from 'sequelize';

import { db } from '../../db/connection';
import { UserAttr } from './interface';
import { duiIsValid } from '../../lib/helpers';

const User = db.define<UserAttr>('User', {
	id: {
		type: DataTypes.SMALLINT,
		primaryKey: true,
		autoIncrement: true,
		allowNull: false
	},
	name: {
		type: DataTypes.STRING,
		allowNull: false
	},
	nickName: {
		type: DataTypes.STRING,
		allowNull: false,
		unique: true
	},
	password: {
		type: DataTypes.STRING,
		allowNull: false
	},
	dui: {
		type: DataTypes.STRING(11),
		allowNull: true,
		validate: {
			isValid(value: string) {
				if (value && !duiIsValid(value)) throw 'Cedula invalida';
			}
		}
	},
	phone: {
		type: DataTypes.STRING(10),
		allowNull: true
	},
	birthday: {
		type: DataTypes.DATEONLY,
		allowNull: true,
		defaultValue: null
	},
	role: {
		type: DataTypes.STRING(6),
		allowNull: false,
		validate: {
			isIn: [['ADMIN', 'SELLER']]
		}
	},
	isActive: {
		type: DataTypes.BOOLEAN,
		defaultValue: true,
		allowNull: false
	}
});

export { User };
