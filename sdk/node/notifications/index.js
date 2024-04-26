const { validate, msgSchema } = require('../utils/validator')
const { ServiceError, GRPCError, ValidationError } = require('../utils/errors')
function send (client, metadata, data) {
  return new Promise((resolve, reject) => {
    try {
      validate(data, msgSchema)
      const { payload, notification } = data
      const msg = {
        payload: JSON.stringify(payload),
        notification: JSON.stringify(notification)
      }
      client.sendNotification(msg, metadata, (err, res) => {
        if (err) {
          const error = new GRPCError(err.message, err.code, err.details)
          reject(error)
        } else {
          resolve(res)
        }
      })
    } catch (err) {
      if (err instanceof ValidationError) reject(err)
      reject(new ServiceError(err))
    }
  })
}

module.exports = {
  send
}
