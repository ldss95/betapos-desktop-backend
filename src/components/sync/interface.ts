import { Model } from 'sequelize'

export interface SyncAttr extends Model {
    id?: string;
    path: string;
    data: object;
    method: 'PUT' | 'POST';
    status: 'DONE' | 'PENDING';
    createdAt?: string;
    updatedAt?: string;
}