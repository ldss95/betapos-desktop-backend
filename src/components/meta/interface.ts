import { Model } from 'sequelize'

export interface MetaAttr extends Model {
    shopId: number;
    lastTicketNumber: number;
    printerIp: string;
    sendEmails: string[];
    allowToInvoiceGenericProduct: boolean;
}