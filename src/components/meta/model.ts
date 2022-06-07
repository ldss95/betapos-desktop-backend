import { DataTypes } from 'sequelize'

import { db } from '../../db/connection'
import { MetaAttr } from './interface'

const Meta = db.define<MetaAttr>('Meta', {
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
		type: DataTypes.JSON,
		allowNull: true
	},
	allowToInvoiceGenericProduct: {
		type: DataTypes.BOOLEAN,
		allowNull: false,
		defaultValue: true
	},
	defaultSalesMode: {
		type: DataTypes.ENUM('SEARCH', 'BARCODE'),
		allowNull: false,
		defaultValue: 'BARCODE'
	},
	scalePrefix: DataTypes.STRING(10),
	scaleDecimalsWight: DataTypes.TINYINT,
	scaleIntWight: DataTypes.TINYINT,
	scaleBarcodeLength: DataTypes.TINYINT,
	printerName: DataTypes.STRING,
	cardTransactionCost: {
		type: DataTypes.DECIMAL(10, 2),
		allowNull: false,
		defaultValue: 0
	}
}, { timestamps: false })

Meta.removeAttribute('id')

export { Meta }