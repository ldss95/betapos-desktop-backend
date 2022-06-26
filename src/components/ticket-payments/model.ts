import { DataTypes } from 'sequelize'

import { db } from '../../db/connection'
import { TicketPaymentAttr } from './interface'
import { TicketPaymentType } from '../ticket-payments-types/model'

const TicketPayment = db.define<TicketPaymentAttr>('TicketsPayment', {
	id: {
		type: DataTypes.UUID,
		primaryKey: true,
		defaultValue: DataTypes.UUIDV4
	},
	ticketId: {
		type: DataTypes.UUID,
		allowNull: false
	},
	typeId: {
		type: DataTypes.UUID,
		allowNull: false
	},
	amount: {
		type: DataTypes.DOUBLE,
		allowNull: false,
		validate: {
			min: 1
		}
	}
})

TicketPayment.belongsTo(TicketPaymentType, { foreignKey: 'typeId', as: 'type' })

export { TicketPayment }
