import { DataTypes } from 'sequelize'

import { sequelize } from '../../lib/connection'
import { User } from '../users/model'
import { Shift } from '../shifts/model'
import { Product } from '../products/model'

const Ticket = sequelize.define('Ticket', {
	id: {
		type: DataTypes.UUID,
		defaultValue: DataTypes.UUIDV4,
		primaryKey: true,
		allowNull: false,
		unique: true
	},
	ticketNumber: {
		type: DataTypes.BIGINT,
		autoIncrement: true,
		allowNull: false
	},
	amount: {
		type: DataTypes.FLOAT,
		allowNull: false
	},
	status: {
		type: DataTypes.STRING,
		allowNull: false,
		validate: {
			isIn: [['IN PROCESS', 'DONE', 'PAUSED', 'CANCELLED']]
		}
	}
})

const TicketProduct = sequelize.define('TicketProduct', {
	quantity: {
		type: DataTypes.TINYINT,
		allowNull: false,
		defaultValue: 1
	},
	price: {
		type: DataTypes.FLOAT,
		allowNull: false
	}
})

Ticket.belongsTo(User)
Ticket.belongsTo(Shift)
TicketProduct.hasOne(Product)

Ticket.sync({ force: false })
TicketProduct.sync({ force: false })

export {
	Ticket,
	TicketProduct
}