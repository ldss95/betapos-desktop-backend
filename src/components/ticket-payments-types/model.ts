import axios from 'axios'
import { DataTypes } from 'sequelize'

import { db } from '../../db/connection'
import { TicketPaymentTypeAttr } from './interface'
const { API_URL } = process.env

const TicketPaymentType = db.define<TicketPaymentTypeAttr>('TicketPaymentTypes', {
	id: {
		type: DataTypes.UUID,
		primaryKey: true,
		defaultValue: DataTypes.UUIDV4
	},
	name: {
		type: DataTypes.STRING,
		allowNull: false,
		unique: true
	},
	description: DataTypes.STRING
});

(async () => {
	try {
		await TicketPaymentType
		const { data } = await axios.get(API_URL + '/sales-payment-types')
		await TicketPaymentType.bulkCreate(data, { ignoreDuplicates: true })
	} catch (error) {
		throw error	
	}
})()


export { TicketPaymentType }
