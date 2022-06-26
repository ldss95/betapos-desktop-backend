import { DataTypes } from 'sequelize'

import { db } from '../../db/connection'
import { ClientAttr } from './interface'

const Client = db.define<ClientAttr>('Client', {
	id: {
		type: DataTypes.UUID,
		defaultValue: DataTypes.UUIDV4,
		primaryKey: true
	},
	name: {
		type: DataTypes.STRING,
		allowNull: false
	},
	dui: {
		type: DataTypes.CHAR(11),
		set: function (value: string) {
			if (value && value != '') {
				this.setDataValue('dui', value.replace(/[^0-9]/g, ''))
			}
		}
	},
	photoUrl: {
		type: DataTypes.STRING,
		validate: {
			isUrl: true
		}
	},
	email: {
		type: DataTypes.STRING,
		validate: {
			isEmail: true
		}
	},
	phone: {
		type: DataTypes.STRING(15),
		set: function (value: string) {
			if (value && value != '') {
				this.setDataValue('phone', value.replace(/[^0-9]/g, ''))
			}
		}
	},
	address: DataTypes.STRING,
	hasCredit: {
		type: DataTypes.BOOLEAN,
		defaultValue: false,
		allowNull: false
	}
})

export { Client }
