import sequelize from 'sequelize'
import { UniqueConstraintError } from 'sequelize'

import { firebaseConnection } from '../../db/firebase'
import { Meta } from '../meta/model'
import { Product, Barcode } from '../products/model'

async function listen() {
	const meta = await Meta.findOne({ attributes: ['shopId'] })
	if (meta) {
		/**
			Function to delete doc after get data
		*/
		const deleteDoc = (id: string) => {
			firebaseConnection.collection('updates').doc(id).delete()
		}

		/**
			Catch errors 
		*/
		const customCatch = (errors: string[]) => {
			throw new Error(errors.join("\n\n"))
		}

		/**
			Products 
		*/
		firebaseConnection
			.collection('updates')
			.where('shopId', '==', meta!.shopId)
			.where('table', '==', 'products')
			.onSnapshot(snap => {
				const { docs } = snap
				const errors: string[] = []

				docs.forEach(async (doc, index) => {
					try {
						const { data, type } = doc.data()
						if (type == 'create') {
							await Product.create(data, { include: { model: Barcode, as: 'barcodes' } })
						} else if (type == 'update') {
							await Product.update(data, { where: { id: data.id } })
						}

						deleteDoc(doc.id)
					} catch (error) {
						if (error instanceof UniqueConstraintError) {
							deleteDoc(doc.id)
						} else if (error.errors) {
							let message = `\nfirebaseDocumentId: ${doc.id} \n`
								message += `message: Sync create product: ${error.errors[0].message}`
								
							errors.push(message)
						} else {
							let message = `\nfirebaseDocumentId: ${doc.id} \n`
								message += `message: Sync create product: ${JSON.stringify(error)}`
							
							errors.push(message)
						}
					}

					const errorQuantity = Object.keys(errors).length
					if (errorQuantity > 0 && index == (docs.length - 1)) {
						customCatch(errors)
					}
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
				const { docs } = snap
				const errors: string[] = []

				docs.forEach(async (doc, index) => {
					try {
						const { data, type } = doc.data()

						if (type == 'create') {
							await Barcode.create(data)
						} else if (type == 'update') {
							await Barcode.update(data, { where: { id: data.id } })
						}

						deleteDoc(doc.id)
					} catch (error) {
						if (error instanceof UniqueConstraintError) {
							deleteDoc(doc.id)
						} else if (error.errors) {
							let message = `\nfirebaseDocumentId: ${doc.id} \n`
								message += `message: Sync create product: ${error.errors[0].message}`
								
							errors.push(message)
						} else {
							let message = `\nfirebaseDocumentId: ${doc.id} \n`
								message += `message: Sync create product: ${JSON.stringify(error)}`
							
							errors.push(message)
						}
					}
					
					const errorQuantity = Object.keys(errors).length
					if (errorQuantity > 0 && index == (docs.length - 1)) {
						customCatch(errors)
					}
				})
			}, error => {
				throw error
			})
	}
}

export { listen }