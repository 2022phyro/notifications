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
  if (message.retries === 2) {
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
    const recipent = await User.get(message.data.userId, appConfig.id)
    if (!recipent) return
    const promises = recipent.devices.map(async (device) => {
      const subscription = {
        endpoint: device.endpoint,
        keys: {
          auth: device.auth,
          p256dh: device.p256dh
        }
      }
      webpush.setVapidDetails(appConfig.vapidDetails.subject, appConfig.vapidDetails.publicKey, appConfig.vapidDetails.privateKey)
      const timeout = new Promise((resolve, reject) => {
        const id = setTimeout(() => {
          clearTimeout(id)
          const err = new Error('Timed out in 5000ms.')
          err.code = 'ETIMEDOUT'
          reject(err)
        }, 5000)
      })

      const send = webpush.sendNotification(subscription, JSON.stringify(message))
      return Promise.race([send, timeout]).then(async (result) => {
        webpushLogger.info(`${result.statusCode} - Message ${message.data._id} sent to location ${result.headers.location}`)
        await success(message)
      }).catch(async (err) => {
        webpushLogger.error(err)
        if ((err.code && err.code === 'ETIMEDOUT') || (err.name && err.name === 'WebPushError')) {
          await reschedule(message, appConfig)
        }
      })
    })
    return Promise.all(promises)
  } catch (err) {
    webpushLogger.error(err)
  }
}

module.exports = {
  sendNotification
}
