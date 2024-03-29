const pino = require('pino')

const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      translateTime: 'SYS:dd-mm-yyyy HH:MM:ss'
      // hideObject: true
    }
  }
}, pino.destination('logs/general.log'))

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
}, pino.destination('logs/express.log'))

const queueLogger = logger.child({ name: 'RabbitMQ' })
const gRPCLogger = logger.child({ name: 'gRPC' })
const fcmLogger = logger.child({ name: 'FCM' })
const dbLogger = logger.child({ name: 'MongoDB' })

module.exports = {
  serverLogger,
  queueLogger,
  gRPCLogger,
  fcmLogger,
  dbLogger,
  logger
}
