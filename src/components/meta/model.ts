import { DataTypes } from 'sequelize'

import { sequelize } from '../../lib/connection'
import { MetaAttr } from './interface'

const Meta = sequelize.define<MetaAttr>('Meta', {
	shopId: {
		type: DataTypes.TINYINT,
		allowNull: false
	},
	lastTicketNumber: {
		type: DataTypes.BIGINT,
		allowNull: false
	},
	printerIp: {
		type: DataTypes.STRING(15),
		allowNull: true,
		validate: {
			isIPv4: true
		}
	},
	sendEmails: {
		type: DataTypes.STRING,
		allowNull: true,
		get() {
			const value = this.getDataValue('sendEmails')
			return (value) ? value.split(','): value
		},
		set(value: string[]) {
			this.setDataValue('sendEmails', value.join(','))
		}
	}
}, { timestamps: false })

Meta.removeAttribute('id')

export { Meta }