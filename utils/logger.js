const pino = require('pino')

const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      translateTime: 'SYS:dd-mm-yyyy HH:MM:ss'
      // hideObject: true
    }
  }
})

const serverLogger = pino({
  name: 'Express',
  transport: {
    target: 'pino-pretty',
    options: {
      translateTime: 'SYS:dd-mm-yyyy HH:MM:ss',
      messageFormat: '{req.method} {req.url} {res.statusCode} - - {responseTime} ms',
      hideObject: true
    }
  }
})

const queueLogger = logger.child({ name: 'RabbitMQ' })
const fcmLogger = logger.child({ name: 'FCM' })
const dbLogger = logger.child({ name: 'MongoDB' })
module.exports = {
  serverLogger,
  queueLogger,
  fcmLogger,
  dbLogger,
  logger
}
