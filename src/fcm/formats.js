const admin = require('./config')
// const Anc = require('firebase-admin')
const MessageService = require('../service/message')
function sendMessage (message) {
  const msgId = message._id
  delete message._id
  message.data = { _id: msgId, ...message.data }
  admin.messaging().send(message)
    .then(() => {
      MessageService.update(msgId, { status: 'SUCCESS' })
      console.log(`[INFO] - fcm - Message with id ${msgId} sent successfully`)
    })
    .catch((error) => {
      MessageService.update(msgId, { status: 'FAILURE', error: error.message })
      // Reschedule the message to be sent
      console.log(`[INFO] - fcm - Message with id ${msgId} failed sending. Resheduling...`)
    })
}

module.exports = {
  sendMessage
}
