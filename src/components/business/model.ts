import { DataTypes } from 'sequelize'

import { db } from '../../db/connection'
import { BusinessAttr } from './interface'

const Business = db.define<BusinessAttr>('Business', {
	id: {
		type: DataTypes.UUID,
		defaultValue: DataTypes.UUIDV4,
		primaryKey: true
	},
	name: {
		type: DataTypes.STRING(60),
		allowNull: false
	},
	address: DataTypes.STRING(200),
	email: {
		type: DataTypes.STRING(60),
		unique: true,
		validate: {
			isEmail: true
		}
	},
	phone: DataTypes.CHAR(10),
	rnc: DataTypes.CHAR(9),
	logoUrl: DataTypes.STRING(400),
	isActive: {
		type: DataTypes.BOOLEAN,
		defaultValue: true,
		allowNull: false
	}
})

export { Business }
