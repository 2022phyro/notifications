const admin = require('./config')
const MessageService = require('../service/message')
const { buildMessage } = require('./formats')
const { fcmLogger } = require('../../utils/logger')

function sendMessage (message) {
  const msgId = message._id
  delete message._id
  message.data = { _id: msgId, ...message.data }
  const msg = buildMessage(message)
  // console.log(JSON.stringify(msg, null, 2))
  const Msg = admin.messaging()
  Msg.send(msg)
    .then(async (value) => {
      fcmLogger.info(`Message with id ${msgId} sent successfully. Firebase ID: ${value}`)
      await MessageService.updateMessage(msgId, { status: 'SUCCESS' })
    })
    .catch(async (error) => {
      console.error(error)
      fcmLogger.error(error)
      const updatedMsg = await MessageService.updateMessage(msgId, { status: 'FAILURE', $inc: { retries: 1 } })
      if (updatedMsg <= 5) {
        fcmLogger.info(`Message with id ${msgId} failed sending. Resheduling...`)
      } else {
        await MessageService.deleteMessage(msgId)
      }
    })
}

module.exports = {
  sendMessage
}
