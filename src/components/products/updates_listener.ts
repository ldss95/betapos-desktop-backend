import { firebaseConnection } from '../../db/firebase'
import { Meta } from '../meta/model'
import { Product, Barcode } from '../products/model'

async function listen() {
	const meta = await Meta.findOne({ attributes: ['shopId'] })

	/**
		Products 
	*/
	firebaseConnection
		.collection('updates')
		.where('shopId', '==', meta!.shopId)
		.where('table', '==', 'products')
		.onSnapshot(snap => {
			snap.docs.forEach(async doc => {
				const { data, type } = doc.data()

				if (type == 'create') {
					await Product.create(data, { include: { model: Barcode, as: 'barcodes' } })
				} else if (type == 'update'){
					await Product.update(data, { where: { id: data.id } })
				}

				firebaseConnection.collection('updates').doc(doc.id).delete()
			})
		}, error => {
			throw error
		})

	/**
		Barcodes
	*/
	firebaseConnection
		.collection('updates')
		.where('shopId', '==', meta!.shopId)
		.where('table', '==', 'barcodes')
		.onSnapshot(snap => {
			snap.docs.forEach(async doc => {
				const { data, type } = doc.data()

				if (type == 'create') {
					await Barcode.create(data)
				} else if (type == 'update'){
					await Barcode.update(data, { where: { id: data.id } })
				}

				firebaseConnection.collection('updates').doc(doc.id).delete()
			})
		}, error => {
			throw error
		})
}

export { listen }