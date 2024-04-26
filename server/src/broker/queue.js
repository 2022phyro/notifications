const { queueLogger } = require('../../utils/logger')
async function createRabbitQueue (channel, app) {
  try {
    await channel.assertQueue(app.name)
    queueLogger.info(`Queue ${app.name} created`)
  } catch (error) {
    error.message = 'QueueError: ' + error.message
    queueLogger.error(error)
  }
}

async function updateRabbitQueue (channel, appName, newAppName) {
  try {
    await channel.checkQueue(appName)
    await channel.assertQueue(newAppName)
    await channel.consume(appName, (msg) => {
      if (msg !== null) {
        channel.sendToQueue(newAppName, msg.content)
        channel.ack(msg)
      }
    }, { noAck: false })
    await channel.deleteQueue(appName)

    queueLogger.info(`Queue ${appName} updated to ${newAppName}`)
  } catch (error) {
    error.message = 'QueueError: ' + error.message
    queueLogger.error(error)
  }
}
async function deleteRabbitQueue (channel, appName) {
  try {
    await channel.deleteQueue(appName)
    queueLogger.info(`Queue ${appName} deleted`)
  } catch (error) {
    error.message = 'QueueError: ' + error.message
    queueLogger.error(error)
  }
}
async function consumeMessage (channel, appName, callback) {
  try {
    channel.consume(appName, (msg) => {
      if (msg !== null) {
        try {
          channel.ack(msg)
          callback(msg.content.toString())
        } catch (error) {
          error.message = 'QueueError: ' + error.message
          // throw error
          channel.nack(msg)
        }
      } else {
        callback(new Error(`No message in queue ${appName}`))
      }
    }, { noAck: false })
  } catch (error) {
    error.message = 'QueueError: ' + error.message
    queueLogger.error(error)
  }
}

async function sendToQueue (channel, queue, message) {
  try {
    let success = true
    let error
    channel.assertQueue(queue, { durable: true })
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), { persistent: true }, (err) => {
      if (err) {
        success = false
        error = err.message
      }
    })
    return [success, error]
  } catch (error) {
    return [false, error.message]
  }
}
module.exports = {
  consumeMessage,
  createRabbitQueue,
  deleteRabbitQueue,
  updateRabbitQueue,
  sendToQueue
}
