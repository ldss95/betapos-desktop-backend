import { DataTypes } from 'sequelize';

import { sequelize } from '../../lib/connection';
import { duiIsValid } from '../../lib/helpers';

const User = sequelize.define('User', {
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