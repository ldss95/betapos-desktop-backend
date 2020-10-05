import { DataTypes } from 'sequelize';

import { sequelize } from '../../lib/connection';
import { CashFlowAttr } from './interface';
import { User } from '../users/model';
import { Shift } from '../shifts/model';

const CashFlow = sequelize.define<CashFlowAttr>('CashFlow', {
	id: {
		type: DataTypes.UUID,
		defaultValue: DataTypes.UUIDV4,
		primaryKey: true,
		unique: true,
		allowNull: false
	},
	type: {
		type: DataTypes.STRING(3),
		allowNull: false,
		validate: {
			isIn: [['IN', 'OUT']]
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
		allowNull: false
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