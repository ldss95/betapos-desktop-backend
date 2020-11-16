import { DataTypes } from 'sequelize';

import { db } from '../../db/connection';
import { CashFlowAttr } from './interface';
import { User } from '../users/model';
import { Shift } from '../shifts/model';

const CashFlow = db.define<CashFlowAttr>('CashFlow', {
	id: {
		type: DataTypes.UUID,
		defaultValue: DataTypes.UUIDV4,
		primaryKey: true,
		unique: true,
		allowNull: false
	},
	type: {
		type: DataTypes.STRING(5),
		allowNull: false,
		validate: {
			isIn: [['IN', 'OUT', 'CHECK']]
		}
	},
	amount: {
		type: DataTypes.FLOAT,
		allowNull: false,
		validate: {
			min: 0
		}
	},
	description: {
		type: DataTypes.STRING,
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
	userId: {
		type: DataTypes.SMALLINT,
		allowNull: false
	},
	shiftId: {
		type: DataTypes.UUID,
		allowNull: false
	}
});

CashFlow.belongsTo(User, { foreignKey: 'userId' });
CashFlow.belongsTo(Shift, { foreignKey: 'shiftId' });

export { CashFlow };
