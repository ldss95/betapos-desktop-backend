import { DataTypes } from 'sequelize';

import { db } from '../../db/connection';
import { UpdatesAttr } from './interface';

const Update = db.define<UpdatesAttr>('Update', {
	table: {
		type: DataTypes.STRING,
		primaryKey: true
	},
	date: DataTypes.DATE
}, { timestamps: false })

export { Update }