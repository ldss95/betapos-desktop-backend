import { Op } from 'sequelize'
import axios from 'axios'
import { doc, onSnapshot } from 'firebase/firestore'

import { db } from '../db/firebase'
import { Product, Barcode } from '../components/products/model'
import { User } from '../components/users/model'
import { Update } from '../components/update/model'

const {
	API_URL,
	MERCHANT_ID
} = process.env;

let unsubscribers: any = []

async function listen() {
		for(const unsubscribe of unsubscribers) {
			unsubscribe()
		}
		
		const productsRef = doc(db, MERCHANT_ID!, 'products')
		const productsUnsubscriber = onSnapshot(productsRef, async (doc) => {
			try {
				const data = doc.data()
				if (!data) {
					return;
				}

				// Productos eliminados
				const { deleted, lastUpdate } = data;
				if (deleted && deleted.length > 0) {
					Product.destroy({
						where: {
							id: {
								[Op.in]: deleted
							}
						}
					})
				}

				const update = await Update.findOne({
					where: { table: 'products' }
				})

				if(!update){
					await Update.create({ table: 'products' })
				}

				if(update?.date == lastUpdate){
					return;
				}

				const { data: { created, updated } } = await axios.get(
					`${API_URL}/products/updates/${update?.date || 'ALL'}`,
					{
						headers: {
							merchantId: MERCHANT_ID!
						}
					}
				);

				// Productos modificados
				for(const product of updated){
					await Product.update(product, {
						where: {
							id: product.id
						}
					})
				}

				// Productos nuevos
				await Product.bulkCreate(created, {
					ignoreDuplicates: true
				});

				// Codigos de barra nuevos
				await Barcode.bulkCreate(created.map(({ barcodes }: any) => barcodes).flat(), {
					ignoreDuplicates: true
				})

				await Update.update({ date: lastUpdate }, {
					where: {
						table: 'products'
					}
				})
			} catch (error) {
				console.log(error)
				// throw error;
			}
		}, (error: any) => {
			throw error
		})

		unsubscribers.push(productsUnsubscriber)

		const barcodesRef = doc(db, MERCHANT_ID!, 'barcodes')
		const barcodesUnsubscribers = onSnapshot(barcodesRef, async (doc) => {
			try {
				const data: any = doc.data();
				if (!data) {
					return;
				}

				// Barcodes eliminados
				const { deleted, lastUpdate } = data;
				if (deleted && deleted.length > 0) {
					Barcode.destroy({
						where: {
							id: {
								[Op.in]: deleted
							}
						}
					})
				}

				const update = await Update.findOne({
					where: { table: 'barcodes' }
				})

				if(!update){
					await Update.create({ table: 'barcodes' })
				}

				if(update?.date == lastUpdate){
					return;
				}

				const { data: { created, updated } } = await axios.get(
					`${API_URL}/barcodes/updates/${update?.date || 'ALL'}`,
					{
						headers: {
							merchantId: MERCHANT_ID!
						}
					}
				);

				// Barcodes modificados
				for(const barcode of updated){
					await Barcode.update(barcode, {
						where: {
							id: barcode.id
						}
					})
				}

				// Barcodes nuevos
				await Barcode.bulkCreate(created, { ignoreDuplicates: true });

				await Update.update({ date: lastUpdate }, {
					where: { table: 'barcodes' }
				})
			} catch (error) {
				throw error;
			}
		}, (error: any) => {
			throw error
		})

		unsubscribers.push(barcodesUnsubscribers)

		const usersRef = doc(db, MERCHANT_ID!, 'users')
		const usersUnsubscribers = onSnapshot(usersRef, async (doc) => {
			try {
				const data: any = doc.data();
				if (!data) {
					return;
				}

				// Usuarios eliminados
				const { deleted, lastUpdate } = data;
				if (deleted && deleted.length > 0) {
					User.destroy({
						where: {
							id: {
								[Op.in]: deleted
							}
						}
					})
				}

				const update = await Update.findOne({
					where: { table: 'users' }
				})

				if(!update){
					await Update.create({ table: 'users' })
				}

				if(update?.date == lastUpdate){
					return;
				}

				const { data: { created, updated } } = await axios.get(
					`${API_URL}/users/updates/${update?.date || 'ALL'}`,
					{
						headers: {
							merchantId: MERCHANT_ID!
						}
					}
				);

				// Usuarios modificados
				for(const user of updated){
					await User.update(user, {
						where: {
							id: user.id
						}
					})
				}

				// Usuarios nuevos
				await User.bulkCreate(created, { ignoreDuplicates: true });

				await Update.update({ date: lastUpdate }, {
					where: { table: 'users' }
				})
			} catch (error) {
				throw error;
			}
		}, (error: any) => {
			throw error
		})

		unsubscribers.push(usersUnsubscribers)
}

export { listen }