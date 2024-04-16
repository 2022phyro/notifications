const { fcmSchema, validateSchema } = require('../../utils/validate')
const channelPromise = require('../../config/rabbitmq')
const Message = require('../DAO/message')
const App = require('../DAO/app')
const broker = require('../broker/queue')
const { queueLogger } = require('../../utils/logger')
require('dotenv').config()
const config = require('../webPush/config')
const { sendNotification } = require('../webPush/send')
async function scheduleMessage (channel, msg) {
  try {
    if (msg instanceof Error) throw msg
    const message = JSON.parse(msg)
    const queue = process.env.FCM_QUEUE
    validateSchema(message, fcmSchema)
    const newMsg = await Message.createMessage(message.payload, message.notification)
    newMsg.value.data = { _id: newMsg._id, ...newMsg.value.data, ...message.payload }
    const [stat, err] = await broker.sendToQueue(channel, queue, newMsg.value)
    if (!stat) {
      // Reschedule
      queueLogger.error(err)
    } else {
      queueLogger.info(` Message ${newMsg._id} successfully sent to queue`)
      return newMsg
    }
  } catch (error) {
    console.error(error)
    queueLogger.error('Error scheduling message: ' + error)
    throw error
  }
}

async function startConsuming () {
  const apps = await App.getApps()
  const { confirmChannel, channel } = await channelPromise
  await Promise.all(apps.map(async (app) => {
    await broker.consumeMessage(channel, app.name, async (message) => {
      await scheduleMessage(confirmChannel, message)
    })
  }))
}

async function startSending () {
  const queue = process.env.FCM_QUEUE
  const { channel } = await channelPromise
  const apps = await App.getApps({}, true)
  const appsConfig = apps.map(app => ({
    id: app._id.toString(),
    vapidDetails: config(app)
  }))
  await broker.consumeMessage(channel, queue, async (message) => {
    try {
      if (message instanceof Error) throw message
      const msg = JSON.parse(message)
      const app = appsConfig.find(app => app.id === msg.data.appId)
      await sendNotification(msg, app)
    } catch (error) {
      queueLogger.error('Error sending message: ' + error)
    }
  })
}

module.exports = {
  scheduleMessage,
  startConsuming,
  startSending
}
