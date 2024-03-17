const { fcmSchema, validateSchema } = require('../../utils/validate')

async function saveMsgToDB (msg) {
  try {
    if (msg instanceof Error) {
      throw msg
    }
    const message = JSON.parse(msg)
    switch (message.payload && message.payload.nType) {
      case 'fcm':
        validateSchema(message, fcmSchema)
        console.log(`Message saved to DB: ${msg}`)
        break
      case 'mail':
        // Validate and handle mail message
        break
      case 'sms':
        // Validate and handle SMS message
        break
      default:
        // throw new Error('Invalid message format')
        break
    }
  } catch (error) {
    console.error(`Error while saving message to DB ${error}`)
    throw error
  }
}

module.exports = {
  saveMsgToDB
}
