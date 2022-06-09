import { Model } from 'sequelize'

export interface MetaAttr extends Model {
	device: {
		deviceId: string;
		name: string;
		isActive: boolean;
		pushNotificationsToken: string;
	};
	lastTicketNumber: number;
	printerIp: string;
	sendEmails: string[];
	allowToInvoiceGenericProduct: boolean;
	defaultSalesMode: 'SEARCH' | 'BARCODE';
	scalePrefix: string;
	scaleDecimalsWight: number;
	scaleIntWight: number;
	scaleBarcodeLength: number;
	printerName: string;
	cardTransactionCost: number;
}