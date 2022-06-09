import { DataTypes } from 'sequelize'
import { machineIdSync } from 'node-machine-id'
import os from 'os'
import axios from 'axios'

import { db } from '../../db/connection'
import { MetaAttr } from './interface'

const Meta = db.define<MetaAttr>('Meta', {
	device: {
		type: DataTypes.JSON,
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
}, { timestamps: false });

(async () => {
	await Meta.removeAttribute('id')
	await Meta.sync()

	try {
		const meta = await Meta.findOne();

		if (meta) {
			return;
		}

		const deviceId = machineIdSync(true)
		const {
			API_URL,
			MERCHANT_ID
		} = process.env;

		await axios.post(`${API_URL}/devices`, {
			merchantId: MERCHANT_ID,
			deviceId,
			code: os.platform(),
			release: parseInt(os.release()),
			version: os.version(),
			arch: os.arch(),
			name: os.hostname()
		});

		await Meta.create({
			device: {
				deviceId,
				name: os.hostname(),
				isActive: true
			},
			lastTicketNumber: 0,
			printerIp: '10.0.0.2',
			sendEmails: ['luisdavidsantiagosantana@gmail.com'],
			allowToInvoiceGenericProduct: true,
			defaultSalesMode: 'BARCODE',
			cardTransactionCost: 0
		})
	} catch (error) {
		if (axios.isAxiosError(error)) {
			const copy: any = error;
			console.warn(copy?.response?.data?.message)
		}
	}
})()

export { Meta }