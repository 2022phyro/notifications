const admin = require('firebase-admin')
require('dotenv').config()
const serviceAccount = require(process.env.FCM_SECRET_KEY)

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
})
module.exports = admin
