const setupRabbitMQ = require('../../config/rabbitmq')

const channel = setupRabbitMQ()

async function createRabbitQueue (app) {
  try {
    await channel.assertQueue(app.name)
    console.log(`Queue ${app.name} created`)
  } catch (error) {
    console.error(`Error while creating queue ${app.name}`, error)
    throw error
  }
}

async function updateRabbitQueue (appName, newAppName) {
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

async function deleteRabbitQueue (app) {
  try {
    await channel.deleteQueue(app.name)
    console.log(`Queue ${app.name} deleted`)
  } catch (error) {
    console.error(`Error while deleting queue ${app.name}`, error)
    throw error
  }
}
async function consumeMessage (app) {
  try {
    let message
    await channel.consume(app.name, (msg) => {
      message = msg.content.toString()
      channel.ack(msg)
    }, { noAck: false })
    return JSON.parse(message)
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
