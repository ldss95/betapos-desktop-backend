import { DataTypes } from 'sequelize';

import { sequelize } from '../../lib/connection';
import { ProductAttr, BarcodeAttr } from './interface';

const Product = sequelize.define<ProductAttr>(
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
		stock: {
			type: DataTypes.SMALLINT,
			allowNull: false
		},
		price: {
			type: DataTypes.FLOAT,
			allowNull: false
		}
	},
	{ timestamps: false }
);

const Barcode = sequelize.define<BarcodeAttr>(
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
			allowNull: false,
			unique: true
		}
	},
	{ timestamps: false }
);

Product.hasMany(Barcode, { foreignKey: 'productId' });

export { Product, Barcode };
