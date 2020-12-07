import { UniqueConstraintError, ForeignKeyConstraintError } from 'sequelize'

import { firebaseConnection } from '../db/firebase'
import { Meta } from '../components/meta/model'
import { Product, Barcode } from '../components/products/model'
import { User } from '../components/users/model'

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

		firebaseConnection
			.collection('updates')
			.where('shopId', '==', meta!.shopId)
			.onSnapshot(snap => {
				const { docs } = snap
				const errors: string[] = []

				const cycleAndSync = (docs: any[]) => {
					const pending: any[] = []

					docs.forEach(async (doc, index) => {
						try {
							const { data, type, table } = doc.data()
							switch (table) {
								case 'products':
									if (type == 'create') {
										await Product.create(data, { include: { model: Barcode, as: 'barcodes' } })
									} else if (type == 'update') {
										await Product.update(data, { where: { id: data.id } })
									}
			
									break;
								case 'barcodes':
									if (type == 'create') {
										await Barcode.create(data)
									} else if (type == 'update') {
										await Barcode.update(data, { where: { id: data.id } })
									}
									break;
								case 'users':
									if (type == 'create') {
										await User.create(data)
									} else if (type == 'update') {
										await User.update(data, { where: { id: data.id } })
									}
									break;
							}
	
							deleteDoc(doc.id)
						} catch (error) {
							if (error instanceof UniqueConstraintError) {
								deleteDoc(doc.id)
							} else if (error instanceof ForeignKeyConstraintError) {
								console.log('Wait to create reference before create.')
								pending.push(doc)
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

					if (pending.length > 0)
						cycleAndSync(pending)
				}

				cycleAndSync(docs)
			}, error => {
				throw error
			})
	}
}

export { listen }