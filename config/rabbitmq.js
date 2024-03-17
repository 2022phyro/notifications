const amqp = require('amqplib')

let channel = null
const url = 'amqp://localhost'

const channelPromise = new Promise((resolve, reject) => {
  async function connect () {
    try {
      const connection = await amqp.connect(url)
      channel = await connection.createChannel()

      console.log('Connected to RabbitMQ')

      connection.on('close', () => {
        console.log('RabbitMQ connection closed. Reconnecting...')
        setTimeout(connect, 1000)
      })

      resolve(channel)
    } catch (error) {
      console.error('Error while setting up RabbitMQ', error)
      console.log('Retrying in 5 seconds...')
      setTimeout(connect, 5000)
    }
  }

  connect()
})

module.exports = channelPromise
