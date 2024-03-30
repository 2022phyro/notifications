const { fcmSchema, validateSchema } = require('../../utils/validate')
const channelPromise = require('../../config/rabbitmq')
const Message = require('../DAO/message')
const App = require('../DAO/app')
const broker = require('../broker/queue')
const { sendMessage } = require('../fcm/send')
const { queueLogger } = require('../../utils/logger')

async function scheduleMessage (channel, msg) {
  try {
    let queue
    if (msg instanceof Error) throw msg
    const message = JSON.parse(msg)
    switch (message.payload && message.payload.nType) {
      case 'fcm':
        validateSchema(message, fcmSchema)
        queue = process.env.FCM_QUEUE
        break
      case 'mail':
        // Validate and handle mail message
        break
      case 'sms':
        // Validate and handle SMS message
        break
      default:
        throw new Error('Invalid message format')
    }
    const newMsg = await Message.newMessage(message)
    newMsg.value._id = newMsg._id
    newMsg.value.data = { _id: newMsg._id, ...newMsg.value.data, ...message.payload }
    const [stat, err] = await broker.sendToQueue(channel, queue, newMsg.value)
    if (!stat) {
      // Reschedule
      queueLogger.error(err)
    } else {
      queueLogger.info(` Message ${newMsg._id} successfully sent to queue`)
    }
  } catch (error) {
    queueLogger.error('Error scheduling message' + error)
    throw error
  }
}

async function startConsuming () {
  const apps = await App.getApps()
  const { confirmChannel, channel } = await channelPromise
  await Promise.all(apps.map(async (app) => {
    await broker.consumeMessage(channel, app.name, (message) => {
      scheduleMessage(confirmChannel, message)
    })
  }))
}

async function startSending () {
  const queues = []
  queues.push(process.env.FCM_QUEUE)
  // queues.push(process.env.MAIL_QUEUE)
  // queues.push(process.env.SMS_QUEUE)
  const { channel } = await channelPromise
  await Promise.all(queues.map(async (queue) => {
    await broker.consumeMessage(channel, queue, async (message) => {
      try {
        if (message instanceof Error) throw message
        const msg = JSON.parse(message)
        queueLogger.info(`Message ${msg._id} successfully received`)
        sendMessage(msg)
      } catch (error) {
        queueLogger.error('Error sending message' + error)
      }
    })
  }))
}

module.exports = {
  scheduleMessage,
  startConsuming,
  startSending
}
