const config = require('./config')
const User = require('../../src/DAO/user')
function sendNotification(app, message) {
	const recipent = User.get(message.payload.userId, app._id)
	if (!recipent) return
	const sender = config(app)
	User.devices.forEach(async (device) => {
		const subscription = {
			endpoint: device.endpoint,
			keys: {
				auth: device.auth
				p256dh: device.p256dh
			}
		}
		sender.sendNotification(subscription, JSON.stringify(message.notification))
		// Update the message to success or failed
	})
}

module.exports = {
	sendNotification
}
