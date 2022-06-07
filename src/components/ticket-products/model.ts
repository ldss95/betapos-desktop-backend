import { DataTypes } from 'sequelize';

import { db } from '../../db/connection';
import { TicketProductAttr } from './interface';
import { Product } from '../products/model'

const TicketProduct = db.define<TicketProductAttr>(
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
			type: DataTypes.UUID,
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

TicketProduct.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

export { TicketProduct };
