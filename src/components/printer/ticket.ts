import axios from 'axios';

import { Ticket } from '../tickets/model'
import { TicketProduct } from '../ticket-products/model'
import { Business } from '../business/model';
import { Client } from '../clients/model';
import { User } from '../users/model';
import { Product } from '../products/model';
import { TicketPaymentType } from '../ticket-payments-types/model';

/**
 * Metodo para imprimir un ticket
 * @param id ID del ticket a imprimir
 */
async function printTicket (id: string) {
	try {
		if (!id) {
			throw new Error('El id de la factura es requerido');
		}

		const ticket = await Ticket.findByPk(id, {
			include: [
				{
					model: TicketProduct,
					as: 'products',
					include: [{
						model: Product,
						as: 'product'
					}]
				},
				{
					model: Client,
					as: 'client'
				},
				{
					model: User,
					as: 'seller'
				},
				{
					model: TicketPaymentType,
					as: 'paymentType'
				}
			]
		});

		if (!ticket) {
			throw new Error('Factura no encontrada')
		}

		const business = await Business.findOne()!;
		
		await axios.post('http://localhost/modulos/ventas/print_ticket.php', {
			business: {
				name: business?.name,
				address: business?.address,
				phone: business?.phone,
				rnc: business?.rnc
			},
			...(ticket.clientId) && {
				client: {
					name: ticket.client.name
				}
			},
			shippingAddress: ticket.shippingAddress,
			seller: {
				name: `${ticket.seller.firstName} ${ticket.seller.lastName}`
			},
			ticketNumber: ticket.ticketNumber,
			date: ticket.createdAt,
			products: ticket.products?.map(({ quantity, price, product }) => ({
				quantity,
				price,
				name: product.name,
				itbis: product.itbis
			})),
			amount: ticket.amount,
			discount: ticket.amount,
			itbis: ticket.products?.reduce((total, { quantity, price, product: { itbis } }) => total + (itbis ? (price * quantity / 100 * 18): 0), 0),
			paymentTypeName: ticket.paymentType.name
		})
	} catch (error) {
		throw error;
	}
}

export { printTicket }