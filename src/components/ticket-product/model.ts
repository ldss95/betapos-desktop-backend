import { DataTypes } from 'sequelize';

import { sequelize } from '../../lib/connection';
import { TicketProductAttr } from './interface';

const TicketProduct = sequelize.define<TicketProductAttr>(
	'TicketProduct',
	{
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			allowNull: false,
			unique: true,
			primaryKey: true
		},
		ticketId: {
			type: DataTypes.UUID,
			allowNull: false
		},
		productId: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		quantity: {
			type: DataTypes.TINYINT,
			allowNull: false,
			defaultValue: 1
		},
		price: {
			type: DataTypes.FLOAT,
			allowNull: false
		}
	},
	{ timestamps: false }
);

export { TicketProduct };
