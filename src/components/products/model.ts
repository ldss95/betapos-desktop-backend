import { DataTypes } from 'sequelize';

import { db } from '../../db/connection';
import { ProductAttr, BarcodeAttr } from './interface';

const Product = db.define<ProductAttr>(
	'Product',
	{
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false
		},
		reference: {
			type: DataTypes.STRING,
			allowNull: true,
			unique: true
		},
		photoUrl: {
			type: DataTypes.STRING(400),
			allowNull: true,
			validate: {
				isUrl: true
			}
		},
		cost: DataTypes.FLOAT,
		price: {
			type: DataTypes.FLOAT,
			allowNull: false
		},
		itbis: {
			type: DataTypes.BOOLEAN,
			allowNull: false
		},
		isFractionable: {
			type: DataTypes.BOOLEAN,
			allowNull: false
		}
	},
	{ timestamps: false }
);

const Barcode = db.define<BarcodeAttr>(
	'Barcode',
	{
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
			unique: true,
			allowNull: false
		},
		productId: {
			type: DataTypes.UUID,
			allowNull: false
		},
		barcode: {
			type: DataTypes.STRING(30),
			allowNull: false
		}
	},
	{ timestamps: false }
);

Product.hasMany(Barcode, { foreignKey: 'productId', as: 'barcodes', onDelete: 'cascade' });

export { Product, Barcode };
