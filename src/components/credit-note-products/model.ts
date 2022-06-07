import { DataTypes } from 'sequelize';

import { db } from '../../db/connection';
import { CreditNoteProductAttr } from './interface';
import { Product } from '../products/model'

const CreditNoteProduct = db.define<CreditNoteProductAttr>(
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
			type: DataTypes.UUID,
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
