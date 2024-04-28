const amqp = require('amqplib')
const { queueLogger } = require('../utils/logger')
require('dotenv').config()
let channel = null
let confirmChannel = null
const url = process.env.RABBIT_URL // 'amqp://localhost'

const channelPromise = new Promise((resolve, reject) => {
  async function connect () {
    try {
      const connection = await amqp.connect(url)
      channel = await connection.createChannel()
      confirmChannel = await connection.createConfirmChannel()

      queueLogger.info('Connected to RabbitMQ')

      connection.on('close', () => {
        queueLogger.info('RabbitMQ connection closed. Reconnecting...')
        setTimeout(connect, 1000)
      })

      resolve({ channel, confirmChannel })
    } catch (error) {
      queueLogger.error('Error while setting up RabbitMQ', error)
      queueLogger.info('Retrying in 5 seconds...')
      setTimeout(connect, 5000)
    }
  }

  connect()
})

module.exports = channelPromise
