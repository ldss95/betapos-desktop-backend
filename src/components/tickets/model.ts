import { DataTypes } from 'sequelize';

import { db } from '../../db/connection';
import { TicketAttr } from './interface';
import { User } from '../users/model';
import { Client } from '../clients/model';
import { Shift } from '../shifts/model';
import { TicketProduct } from '../ticket-products/model';
import { TicketPayment } from '../ticket-payments/model';
import { Meta } from '../meta/model';
import { TicketPaymentType } from '../ticket-payments-types/model';

const Ticket = db.define<TicketAttr>(
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
		clientId: DataTypes.UUID,
		userId: {
			type: DataTypes.UUID,
			allowNull: false
		},
		shiftId: {
			type: DataTypes.UUID,
			allowNull: false	
		},
		amount: {
			type: DataTypes.FLOAT,
			allowNull: false
		},
		discount: {
			type: DataTypes.FLOAT,
			allowNull: false,
			defaultValue: 0
		},
		orderType: {
			type: DataTypes.ENUM('DELIVERY', 'PICKUP'),
			allowNull: false
		},
		paymentTypeId: {
			type: DataTypes.UUID,
			allowNull: false
		},
		shippingAddress: DataTypes.STRING,
		cashReceived: DataTypes.INTEGER,
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
					let last = 0;
					if (max) {
						last = Number(max) | 0;
					} else {
						const meta = await Meta.findOne()
						last = meta!.lastTicketNumber
					}

					model.ticketNumber = last + 1;
				} catch (error) {
					throw error;
				}
			}
		}
	}
);

Ticket.belongsTo(Client, { foreignKey: 'clientId', as: 'client' });
Ticket.belongsTo(User, { foreignKey: 'userId', as: 'seller' });
Ticket.belongsTo(Shift, { foreignKey: 'shiftId' });
Ticket.belongsTo(TicketPaymentType, { foreignKey: 'paymentTypeId', as: 'paymentType' });
Ticket.hasMany(TicketProduct, { foreignKey: 'ticketId', as: 'products' });
Ticket.hasMany(TicketPayment, { foreignKey: 'ticketId', as: 'payments' });
TicketPayment.belongsTo(Ticket, { foreignKey: 'ticketId', as: 'ticket' });

export { Ticket };
