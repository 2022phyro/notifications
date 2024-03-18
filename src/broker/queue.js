async function createRabbitQueue (channel, app) {
  try {
    await channel.assertQueue(app.name)
    console.log(`Queue ${app.name} created`)
  } catch (error) {
    console.error(`Error while creating queue ${app.name}`, error)
    throw error
  }
}

async function updateRabbitQueue (channel, appName, newAppName) {
  try {
    // Create a new queue with the new name
    await channel.assertQueue(newAppName)

    // Move messages from the old queue to the new one
    await channel.consume(appName, (msg) => {
      channel.sendToQueue(newAppName, msg.content)
      channel.ack(msg)
    }, { noAck: false })

    // Delete the old queue
    await channel.deleteQueue(appName)

    console.log(`Queue ${appName} updated to ${newAppName}`)
  } catch (error) {
    console.error(`Error while updating queue ${appName}`, error)
    throw error
  }
}

async function deleteRabbitQueue (channel, appName) {
  try {
    await channel.deleteQueue(appName)
    console.log(`Queue ${appName} deleted`)
  } catch (error) {
    console.error(`Error while deleting queue ${appName}`, error)
    throw error
  }
}
async function consumeMessage (channel, app, callback) {
  try {
    channel.consume(app.name, (msg) => {
      if (msg !== null) {
        try {
          callback(msg.content.toString())
          channel.ack(msg)
        } catch (error) {
          console.error(`Error while processing message from queue ${app.name}`, error)
          channel.nack(msg)
        }
      } else {
        callback(new Error(`No message in queue ${app.name}`))
      }
    }, { noAck: false })
  } catch (error) {
    console.error(`Error while consuming message from queue ${app.name}`, error)
    throw error
  }
}

module.exports = {
  consumeMessage,
  createRabbitQueue,
  deleteRabbitQueue,
  updateRabbitQueue
}
