const admin = require('firebase-admin')
require('dotenv').config({ path: '../../config.env' })
console.log(process.env.GOOGLE_APPLICATION_CREDENTIALS)
const serviceAccount = require('../../config/firebase.secret.key.json')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
})
module.exports = admin
