import { DataTypes } from 'sequelize';

import { sequelize } from '../../lib/connection';
import { TicketProductAttr } from './interface';

const TicketProduct = sequelize.define<TicketProductAttr>(
	'TicketProduct',
	{
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

TicketProduct.removeAttribute('id');

export { TicketProduct };
