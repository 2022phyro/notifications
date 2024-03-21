const pino = require('pino')

const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      translateTime: 'SYS:dd-mm-yyyy HH:MM:ss',
    }
  }
})

const serverLogger = logger.child({ name: 'Express' })
const queueLogger = logger.child({ name: 'QUEUE' })
const fcmLogger = logger.child({ name: 'FCM' })
const dbLogger = logger.child({ name: 'DB' })
module.exports = {
  serverLogger,
  queueLogger,
  fcmLogger,
  dbLogger,
}
