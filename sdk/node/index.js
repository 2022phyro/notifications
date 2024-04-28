const { init } = require('./src/gRPC')
const { send } = require('./src/notifications')

class Notifai {
  constructor (apiKey, appId) {
    this.apiKey = apiKey
    this.appId = appId
  }

  async send (data) {
    const { userId, ...notification } = data
    const message = {
      payload: { userId, appId: this.appId },
      notification
    }
    const { client, metadata } = init(this.apiKey)
    return await send(client, metadata, message)
  }
}

module.exports = Notifai
