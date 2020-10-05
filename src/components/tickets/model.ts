import { DataTypes } from 'sequelize';

import { sequelize } from '../../lib/connection';
import { TicketAttr } from './interface';
import { User } from '../users/model';
import { Shift } from '../shifts/model';
import { Product } from '../products/model';
import { TicketProduct } from '../ticket-product/model';

const Ticket = sequelize.define<TicketAttr>(
	'Ticket',
	{
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
			allowNull: false,
			unique: true
		},
		ticketNumber: {
			type: DataTypes.BIGINT,
			allowNull: true
		},
		amount: {
			type: DataTypes.FLOAT,
			allowNull: false
		},
		status: {
			type: DataTypes.STRING,
			allowNull: false,
			validate: {
				isIn: [['IN PROCESS', 'DONE', 'PAUSED', 'CANCELLED']]
			}
		}
	},
	{
		hooks: {
			beforeCreate: async (model: any) => {
				try {
					const max = await Ticket.max('ticketNumber');
					const last = Number(max) | 0;
					model.ticketNumber = last + 1;
				} catch (error) {
					throw error;
				}
			}
		}
	}
);

Ticket.belongsTo(User, { foreignKey: 'userId' });
Ticket.belongsTo(Shift, { foreignKey: 'shiftId' });
Ticket.hasMany(TicketProduct, { foreignKey: 'ticketId' });
TicketProduct.belongsTo(Product, { foreignKey: 'productId' });

export { Ticket };
