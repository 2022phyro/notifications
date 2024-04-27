const { decrypt } = require('../../utils/encrypt')
// const webpush = require('web-push')
// const urlsafeBase64 = require('urlsafe-base64')

async function config (app) {
  await app.populate('orgId')
  const org = app.orgId
  const publicKey = decrypt(app.vapidKeys.publicKey, org.secret)
  const privateKey = decrypt(app.vapidKeys.privateKey, org.secret)
  return {
    id: app._id,
    subject: `mailto:phyrokelstein2@gmail.com`,
    publicKey,
    privateKey
  }
}
module.exports = config
