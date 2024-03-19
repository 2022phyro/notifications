const { fcmSchema, validateSchema } = require('../../utils/validate')
const channelPromise = require('../../config/rabbitmq')
const MessageService = require('../service/message')
const AppService = require('../service/app')
const broker = require('../broker/queue')

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
    const newMsg = await MessageService.newMessage(message)
    const [stat, err] = await broker.sendToQueue(channel, queue, newMsg.value)
    if (!stat) {
      // Reschedule
      console.error(err)
    } else {
      console.log(`[INFO] - scheduler: Message ${newMsg._id} successfully sent to queue`)
    }
  } catch (error) {
    console.error('Error scheduling message', error)
    throw error
  }
}

async function startConsuming (queue, callback) {
  const apps = await AppService.getApps()
  const { confirmChannel, channel } = await channelPromise
  await Promise.all(apps.map(async (app) => {
    await broker.consumeMessage(channel, app, (message) => {
      scheduleMessage(confirmChannel, message)
    })
  }))
}
module.exports = {
  startConsuming,
  scheduleMessage
}
