const User = require('../../src/DAO/user')
const webpush = require('web-push')
const Message = require('../../src/DAO/message')
const { webpushLogger } = require('../../utils/logger')

async function success (msg) {
  await Message.updateMessage(msg.data._id, { status: 'SUCCESS' })
}

async function reschedule (msg, appConfig) {
  const message = await Message.getMessage(msg.data._id, {}, true)
  if (!message) return
  if (message.retries === 1) {
    message.status = 'FAILED'
  } else {
    message.retries = message.retries + 1
    await sendNotification(msg, appConfig)
  }
  try {
    await message.save()
  } catch (err) {
    err.message = 'Reschedule: ' + err.message
    webpushLogger.error(err)
  }
}
async function sendNotification (message, appConfig) {
  try {
    const recipent = await User.get(message.data.userId, appConfig.id, true)
    if (!recipent) return
    const errors = []
    for (const device of recipent.devices) {
      const subscription = {
        endpoint: device.endpoint,
        keys: {
          auth: device.auth,
          p256dh: device.p256dh
        }
      }
      const { subject, publicKey, privateKey } = appConfig
      webpush.setVapidDetails(subject, publicKey, privateKey)
      try {
        const result = await webpush.sendNotification(subscription, JSON.stringify(message))
        webpushLogger.info(`${result.statusCode} - Message ${message.data._id} sent to location ${result.headers.location}`)
      } catch (err) {
        webpushLogger.error(err)
        if ((err.code && err.code === 'ETIMEDOUT') || (err.name && err.name === 'WebPushError')) {
          errors.push(device)
        }
        if ([410, 404].includes(err.statusCode)) {
          recipent.devices = recipent.devices.filter((d) => d.endpoint !== device.endpoint)
        }
      }
    }
    if (errors.length > 0) {
      console.error(errors)
      // reschedule
    } else {
      await success(message)
    }
    await recipent.save()
  } catch (err) {
    webpushLogger.error(err)
  }
}

module.exports = {
  sendNotification
}
