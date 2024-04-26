const App = require('../../src/DAO/app')
// const webpush = require('web-push')
// const urlsafeBase64 = require('urlsafe-base64')

function config (app) {
  const publicKey = App.decrypt(app, app.vapidKeys.publicKey)
  const privateKey = App.decrypt(app, app.vapidKeys.privateKey)
  // const email = app.email

  // const sender = webpush
  // sender.setVapidDetails(
  //   'mailto:phyrokelstein2@gmail.com', // will be replaced with apps email later
  //   publicKey,
  //   privateKey
  // )
  return {
    subject: 'mailto:phyrokelstein2@gmail.com',
    publicKey,
    privateKey
  }
}
module.exports = config
