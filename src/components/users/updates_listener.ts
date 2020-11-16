import { firebaseConnection } from '../../db/firebase'
import { Meta } from '../meta/model'
import { User } from '../users/model'

async function listen() {
	const meta = await Meta.findOne({ attributes: ['shopId'] })

	firebaseConnection
		.collection('updates')
		.where('shopId', '==', meta!.shopId)
		.where('table', '==', 'users')
		.onSnapshot(snap => {
			snap.docs.forEach(async doc => {
				const { data, type } = doc.data()

				if (type == 'create') {
					await User.create(data)
				} else if (type == 'update'){
					await User.update(data, { where: { id: data.id } })
				}

				firebaseConnection.collection('updates').doc(doc.id).delete()
			})
		}, error => {
			throw error
		})
}

export { listen }