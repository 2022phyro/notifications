const User = require('../../src/DAO/user')
const webpush = require('web-push')
async function sendNotification (message, appConfig) {
  const recipent = await User.get(message.data.userId, appConfig.id)
  if (!recipent) return
  recipent.devices.forEach(async (device) => {
    const subscription = {
      endpoint: device.endpoint,
      keys: {
        auth: device.auth,
        p256dh: device.p256dh
      }
    }
    // console.log(subscription)
    webpush.setVapidDetails(appConfig.vapidDetails.subject, appConfig.vapidDetails.publicKey, appConfig.vapidDetails.privateKey)
    const result = await webpush.sendNotification(subscription, JSON.stringify(message))
    console.log(result.statusCode)
  })
}

module.exports = {
  sendNotification
}
