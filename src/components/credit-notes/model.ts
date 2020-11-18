import { DataTypes } from 'sequelize';

import { db } from '../../db/connection';
import { CreditNoteAttr } from './interface';
import { CreditNoteProduct } from '../credit-note-products/model'
import { Ticket } from '../tickets/model'
import { User } from '../users/model'

const CreditNote = db.define<CreditNoteAttr>(
	'CreditNote',
	{
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			allowNull: false,
			unique: true,
			primaryKey: true
		},
		ticketId: {
			type: DataTypes.UUID,
			allowNull: false,
			unique: true
		},
		amount: {
			type: DataTypes.FLOAT,
			allowNull: false
		},
		description: {
			type: DataTypes.TEXT,
			allowNull: false
		},
		userId: {
			type: DataTypes.SMALLINT,
			allowNull: false
		},
		status: {
			type: DataTypes.STRING(6),
			allowNull: false,
			defaultValue: 'UNUSED',
			validate: {
				isIn: [['UNUSED', 'USED']]
			}
		}
	}
);

CreditNote.belongsTo(User, { foreignKey: 'userId' })
CreditNote.belongsTo(Ticket, { foreignKey: 'ticketId' })
CreditNote.hasMany(CreditNoteProduct, { foreignKey: 'creditNoteId', as: 'products' })

export { CreditNote };
