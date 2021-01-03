import { DataTypes } from 'sequelize';

import { db } from '../../db/connection';
import { ProductAttr, BarcodeAttr } from './interface';

const Product = db.define<ProductAttr>(
	'Product',
	{
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
			allowNull: false
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
		price: {
			type: DataTypes.FLOAT,
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
			type: DataTypes.INTEGER,
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
