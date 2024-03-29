async function createRabbitQueue (channel, app) {
  try {
    await channel.assertQueue(app.name)
    console.log(`Queue ${app.name} created`)
  } catch (error) {
    error.message = 'QueueError: ' + error.message
    throw error
  }
}

async function updateRabbitQueue (channel, appName, newAppName) {
  try {
    // Create a new queue with the new name
    await channel.assertQueue(newAppName)

    // Move messages from the old queue to the new one
    await channel.consume(appName, (msg) => {
      if (msg !== null) {
        channel.sendToQueue(newAppName, msg.content)
        channel.ack(msg)
      }
    }, { noAck: false })

    // Delete the old queue
    await channel.deleteQueue(appName)

    console.log(`Queue ${appName} updated to ${newAppName}`)
  } catch (error) {
    console.error(`Error while updating queue ${appName}`, error)
    error.message = 'QueueError: ' + error.message
    throw error
  }
}

async function deleteRabbitQueue (channel, appName) {
  try {
    await channel.deleteQueue(appName)
    console.log(`Queue ${appName} deleted`)
  } catch (error) {
    error.message = 'QueueError: ' + error.message
    throw error
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
    throw error
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
