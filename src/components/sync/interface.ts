import { Model } from 'sequelize'

export interface SyncAttr extends Model {
    id?: string;
    path: string;
    data: object;
    status: 'DONE' | 'PENDING';
    createdAt?: string;
    updatedAt?: string;
}