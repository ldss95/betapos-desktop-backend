import { DataTypes } from 'sequelize'

import { sequelize } from '../../lib/connection'
import { SyncAttr } from './interface'

const Sync = sequelize.define<SyncAttr>('Sync', {
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
    status: {
        type: DataTypes.STRING(7),
        defaultValue: 'PENDING',
        validate: {
            isIn: [['DONE', 'PENDING']]
        }
    }
})

export { Sync }