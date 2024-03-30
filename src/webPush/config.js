const App = require('../../src/DAO/app')
const webpush = require('web-push')
function config(app) {
	const publicKey = App.decrypt(app, app.vapidKeys.publicKey)
	const privateKey = App.decrypt(app, app.vapidKeys.privateKey)
	// const email = app.email
	const sender = webpush
	sender.setVapidDetails(
		{
			`mailto:${'phyrokelstein2@gmail.com'}`, // will be replaced with apps email later
			publicKey,
			privateKey
		}
	)
	return sender
}

module.exports = config


