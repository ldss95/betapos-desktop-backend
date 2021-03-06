import { Op } from 'sequelize'
import axios from 'axios'
import { doc, onSnapshot } from 'firebase/firestore'

import { db } from '../db/firebase'
import { Product, Barcode } from '../components/products/model'
import { User } from '../components/users/model'
import { Client } from '../components/clients/model'
import { Update } from '../components/update/model'
import { Business } from '../components/business/model'
import { Meta } from '../components/meta/model'

const {
	API_URL,
	MERCHANT_ID
} = process.env;

let unsubscribers: any = []

async function listen() {
	if (!MERCHANT_ID) {
		return console.error('No se puede sincronizar porque no se encontrĂ³ el MERCHANT ID en las variables de entorno')
	}

	for(const unsubscribe of unsubscribers) {
		unsubscribe()
	}
		
	const productsRef = doc(db, MERCHANT_ID, 'products')
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
			if(!axios.isAxiosError(error)){
				throw error;
			}
		}
	}, (error: any) => {
		throw error
	})

	unsubscribers.push(productsUnsubscriber)

	const barcodesRef = doc(db, MERCHANT_ID, 'barcodes')
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
			if(!axios.isAxiosError(error)){
				throw error;
			}
		}
	}, (error) => {
		throw error
	})

	unsubscribers.push(barcodesUnsubscribers)

	const usersRef = doc(db, MERCHANT_ID, 'users')
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
			if(!axios.isAxiosError(error)){
				throw error;
			}
		}
	}, (error: any) => {
		throw error
	})

	unsubscribers.push(usersUnsubscribers)

	const businessRef = doc(db, MERCHANT_ID, 'business')
	const businessUnsubscribers = onSnapshot(businessRef, async (doc) => {
		try {
			const data: any = doc.data();
			if (!data) {
				return;
			}

			const { lastUpdate } = data;
			const business = await Business.findOne();
			const res = await axios.get(
				`${API_URL}/business/by-merchant-id`,
				{
					headers: {
						merchantId: MERCHANT_ID
					}
				}
			);

			if(!res.data) {
				return console.error('Empresa no encontrada, MERCHANT ID incorrecto!');
			}

			if (!business) {
				await Business.create(res.data);

				await Update.bulkCreate([
					{
						table: 'business',
						date: lastUpdate
					},
					{
						table: 'users',
						date: res.data.createdAt
					},
					{
						table: 'products',
						date: res.data.createdAt
					},
					{
						table: 'barcodes',
						date: res.data.createdAt
					},
					{
						table: 'devices',
						date: res.data.createdAt
					},
					{
						table: 'clients',
						date: res.data.createdAt
					}
				], { ignoreDuplicates: true })

				return;
			}
			
			const update = await Update.findOne({
				where: { table: 'business' }
			})

			if(!update){
				await Update.create({ table: 'business' });
			}

			if(update?.date == lastUpdate){
				return;
			}

			await business.update(res.data);
			await Update.update({ date: lastUpdate }, {
				where: { table: 'business' }
			})
		} catch (error) {
			if(!axios.isAxiosError(error)){
				throw error;
			}
		}
	}, (error: any) => {
		throw error
	})

	unsubscribers.push(businessUnsubscribers)

	const devicesRef = doc(db, MERCHANT_ID, 'devices')
	const devicesUnsubscribers = onSnapshot(devicesRef, async (doc) => {
		try {
			const data: any = doc.data();
			if (!data) {
				return;
			}

			const { lastUpdate } = data;
			const meta = await Meta.findOne();
			if(!meta){
				return;
			}

			const res = await axios.get(
				`${API_URL}/devices/updates/${lastUpdate}`,
				{
					headers: {
						merchantId: MERCHANT_ID,
						deviceId: meta.device.deviceId
					}
				}
			);

			if (!res.data) {
				return;
			}

			const update = await Update.findOne({
				where: { table: 'devices' }
			})

			if(!update){
				await Update.create({ table: 'devices' });
			}

			if(update?.date == lastUpdate){
				return;
			}

			await meta.update({
				device: {
					name: res.data.name,
					isActive: res.data.isActive,
				}
			});
			await Update.update({ date: lastUpdate }, {
				where: { table: 'devices' }
			})
		} catch (error) {
			if(!axios.isAxiosError(error)){
				throw error;
			}
		}
	}, (error: any) => {
		throw error
	})

	unsubscribers.push(devicesUnsubscribers)

	const clientsRef = doc(db, MERCHANT_ID, 'clients')
	const clientsUnsubscribers = onSnapshot(clientsRef, async (doc) => {
		try {
			const data: any = doc.data();
			if (!data) {
				return;
			}

			// Usuarios eliminados
			const { deleted, lastUpdate } = data;
			if (deleted && deleted.length > 0) {
				Client.destroy({
					where: {
						id: {
							[Op.in]: deleted
						}
					}
				})
			}

			const update = await Update.findOne({
				where: { table: 'clients' }
			})

			if(!update){
				await Update.create({ table: 'clients' })
			}

			if(update?.date == lastUpdate){
				return;
			}

			const { data: { created, updated } } = await axios.get(
				`${API_URL}/clients/updates/${update?.date || 'ALL'}`,
				{
					headers: {
						merchantId: MERCHANT_ID!
					}
				}
			);

			// Usuarios modificados
			for(const client of updated){
				await Client.update(client, {
					where: {
						id: client.id
					}
				})
			}

			// Usuarios nuevos
			await Client.bulkCreate(created, { ignoreDuplicates: true });

			await Update.update({ date: lastUpdate }, {
				where: { table: 'clients' }
			})
		} catch (error) {
			if(!axios.isAxiosError(error)){
				throw error;
			}
		}
	}, (error: any) => {
		throw error
	})

	unsubscribers.push(clientsUnsubscribers)
}

export { listen }