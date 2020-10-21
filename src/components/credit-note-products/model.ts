import { DataTypes } from 'sequelize';

import { sequelize } from '../../lib/connection';
import { CreditNoteProductAttr } from './interface';
import { Product } from '../products/model'

const CreditNoteProduct = sequelize.define<CreditNoteProductAttr>(
	'CreditNoteProduct',
	{
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			allowNull: false,
			unique: true,
			primaryKey: true
		},
		creditNoteId: {
			type: DataTypes.UUID,
			allowNull: false
		},
		productId: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		quantity: {
			type: DataTypes.TINYINT,
			allowNull: false
		}
	},
	{ timestamps: false }
);

CreditNoteProduct.belongsTo(Product, { foreignKey: 'productId' })

export { CreditNoteProduct };