import { DataTypes } from 'sequelize';

import { db } from '../../db/connection';
import { UpdatesAttr } from './interface';

const Update = db.define<UpdatesAttr>('Update', {
	table: {
		type: DataTypes.STRING,
		primaryKey: true
	},
	date: {
		type: DataTypes.DATE,
		allowNull: false
	}
}, { timestamps: false })

export { Update }