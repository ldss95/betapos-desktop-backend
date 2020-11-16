import { DataTypes } from 'sequelize';

import { db } from '../../db/connection';
import { ShiftAttr } from './interface';
import { User } from '../users/model';

const Shift = db.define<ShiftAttr>(
	'Shift',
	{
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			allowNull: false,
			primaryKey: true,
			unique: true
		},
		userId: {
			type: DataTypes.SMALLINT,
			allowNull: false
		},
		startAmount: {
			type: DataTypes.FLOAT,
			allowNull: false
		},
		startTime: {
			type: DataTypes.TIME,
			allowNull: false,
			defaultValue: DataTypes.NOW
		},
		endAmount: {
			type: DataTypes.FLOAT,
			allowNull: true
		},
		cashDetail: {
			type: DataTypes.TEXT,
			allowNull: true,
			get() {
				const cashDetail = this.getDataValue('cashDetail')
				return (cashDetail) ? JSON.parse(cashDetail) : null
			},
			set(value: object[]) {
				if (value)
					this.setDataValue('cashDetail', JSON.stringify(value))
			}
		},
		endTime: {
			type: DataTypes.TIME,
			allowNull: true
		},
		date: {
			type: DataTypes.DATEONLY,
			defaultValue: DataTypes.NOW,
			allowNull: false
		}
	},
	{
		timestamps: false
	}
);

Shift.belongsTo(User, { foreignKey: 'userId' });

export { Shift };
