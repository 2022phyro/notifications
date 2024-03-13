const amqp = require('amqplib')

async function setupRabbitMQ () {
  try {
    const url = 'amqp://localhost'
    const connection = await amqp.connect(url)
    const channel = await connection.createChannel()
    console.log('Connected to RabbitMQ')
    return channel
  } catch (error) {
    console.error('Error while setting up RabbitMQ', error)
    throw error
  }
}

module.exports = setupRabbitMQ
