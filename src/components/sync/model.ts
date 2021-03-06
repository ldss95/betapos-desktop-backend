import { DataTypes } from 'sequelize'

import { db } from '../../db/connection'
import { SyncAttr } from './interface'

const Sync = db.define<SyncAttr>('Sync', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        unique: true,
        allowNull: false
    },
    path: {
        type: DataTypes.STRING,
        allowNull: false
    },
    data: {
        type: DataTypes.JSON,
        allowNull: false
    },
    method: {
        type: DataTypes.STRING(4),
        allowNull: false,
        validate: {
            isIn: [['PUT', 'POST']]
        }
    },
    status: {
        type: DataTypes.STRING(7),
        defaultValue: 'PENDING',
        validate: {
            isIn: [['DONE', 'PENDING']]
        }
    }
})

export { Sync }