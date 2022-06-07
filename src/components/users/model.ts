import { DataTypes } from 'sequelize';

import { db } from '../../db/connection';
import { UserAttr } from './interface';
import { duiIsValid } from '@ldss95/helpers';

const User = db.define<UserAttr>('User', {
	id: {
		type: DataTypes.UUID,
		defaultValue: DataTypes.UUIDV4,
		primaryKey: true,
	},
	firstName: {
		type: DataTypes.STRING,
		allowNull: false
	},
	lastName: {
		type: DataTypes.STRING,
		allowNull: false
	},
	email: {
		type: DataTypes.STRING,
		unique: true,
		validate: {
			isEmail: true
		}
	},
	nickName: {
		type: DataTypes.STRING,
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
	photoUrl: {
		type: DataTypes.STRING,
		validate: {
			isUrl: true
		}
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
	tfa: {
		type: DataTypes.BOOLEAN,
		allowNull: false,
		defaultValue: 0
	},
	tfaCode: {
		type: DataTypes.STRING,
		allowNull: true
	},
	isActive: {
		type: DataTypes.BOOLEAN,
		defaultValue: true,
		allowNull: false
	}
});

export { User };
