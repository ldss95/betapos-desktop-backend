import { UniqueConstraintError, ForeignKeyConstraintError, Op } from 'sequelize'
import moment from 'moment'
import axios from 'axios'

import { firebaseConnection } from '../db/firebase'
import { Product, Barcode } from '../components/products/model'
import { User } from '../components/users/model'
import { Update } from '../components/update/model'

const API_URL = process.env.API_URL;
let unsubscribers: any = []

async function listen() {
		for(const unsubscribe of unsubscribers) {
			unsubscribe()
		}
		
		const productsUnsubscriber = firebaseConnection.collection('updates')
			.doc('products')
			.onSnapshot(async snap => {
				try {
					const data: any = snap.data();
					if (!data) {
						return;
					}

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
						return;
					}

					if(update.date == lastUpdate){
						return;
					}

					const { data: { created, updated } } = await axios.get(
						`${API_URL}/products/updates/${update.date}`
					);

					// Productos nuevos
					await Product.bulkCreate(created, {
						ignoreDuplicates: true
					});

					// Codigos de barra nuevos
					await Barcode.bulkCreate(created.map(({ barcodes }: any) => barcodes).flat(), {
						ignoreDuplicates: true
					})

					// Productos modificados
					for(const product of updated){
						await Product.update(product, {
							where: {
								id: product.id
							}
						})
					}

					await update.update({ date: lastUpdate })
				} catch (error) {
					console.log(error)
					// throw error;
				}
			}, error => {
				throw error
			})

		unsubscribers.push(productsUnsubscriber)

		const barcodesUnsubscribers = firebaseConnection.collection('updates')
			.doc('barcodes')
			.onSnapshot(async snap => {
				try {
					const data: any = snap.data();
					if (!data) {
						return;
					}

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
						return;
					}

					if(update.date == lastUpdate){
						return;
					}

					const { data: { created, updated } } = await axios.get(
						`${API_URL}/barcodes/updates/${update.date}`
					);

					// Barcodes nuevos
					await Barcode.bulkCreate(created, { ignoreDuplicates: true });

					// Barcodes modificados
					for(const barcode of updated){
						await Barcode.update(barcode, {
							where: {
								id: barcode.id
							}
						})
					}

					await update.update({ date: lastUpdate })
				} catch (error) {
					throw error;
				}
			}, error => {
				throw error
			})

		unsubscribers.push(barcodesUnsubscribers)

		const usersUnsubscribers = firebaseConnection.collection('updates')
			.doc('users')
			.onSnapshot(async snap => {
				try {
					const data: any = snap.data();
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
						return;
					}

					if(update.date == lastUpdate){
						return;
					}

					const { data: { created, updated } } = await axios.get(
						`${API_URL}/users/updates/${update.date}`
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

					await update.update({ date: lastUpdate })
				} catch (error) {
					throw error;
				}
			}, error => {
				throw error
			})

		unsubscribers.push(usersUnsubscribers)
}

export { listen }