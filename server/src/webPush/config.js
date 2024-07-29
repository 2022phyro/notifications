const { decrypt } = require('../../utils/encrypt')
require('dotenv').config()
async function config (app) {
  await app.populate('orgId')
  const org = app.orgId
  const publicKey = decrypt(app.vapidKeys.publicKey, org.secret)
  const privateKey = decrypt(app.vapidKeys.privateKey, org.secret)
  return {
    id: app._id,
    subject: `mailto:${process.env.NOTIFAI_EMAL}`,
    publicKey,
    privateKey
  }
}
module.exports = config
