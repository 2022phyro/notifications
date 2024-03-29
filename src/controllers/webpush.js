const { webpush } = require('../../config/webPush')
async function sendMsg (message) {
  try {
    const msg = JSON.stringify(message)
    await webpush.sendNotification(msg)
  } catch (error) {
    console.error(error)
  }
}

module.exports = {
  sendMsg
}
