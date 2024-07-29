const pino = require('pino')

const expressTransport = pino.transport({
  targets: [
    {
      level: 'trace',
      target: 'pino/file',
      options: {
        destination: 'logs/express.log',
        translateTime: 'SYS:dd-mm-yyyy HH:MM:ss',
        messageFormat: '{req.method} {req.url} {res.statusCode} - - {responseTime} ms',
        hideObject: false
      }
    },
    {
      level: 'trace',
      target: 'pino-pretty',
      options: {
        destination: 1,
        translateTime: 'SYS:dd-mm-yyyy HH:MM:ss',
        messageFormat: '{req.method} {req.url} {res.statusCode} - - {responseTime} ms',
        hideObject: true
      }
    }
  ]
})

const generalTransport = pino.transport({
  targets: [
    {
      level: 'trace',
      target: 'pino/file',
      options: {
        destination: 'logs/general.log',
        translateTime: 'SYS:dd-mm-yyyy HH:MM:ss',
        hideObject: false
      }
    },
    {
      level: 'trace',
      target: 'pino-pretty',
      options: {
        destination: 1,
        translateTime: 'SYS:dd-mm-yyyy HH:MM:ss',
        hideObject: false
      }
    }
  ]
})
const webpushLogger = pino({ name: 'Web-Push' }, generalTransport)
const serverLogger = pino({ name: 'Express' }, expressTransport)
const queueLogger = pino({ name: 'RabbitMQ' }, generalTransport)
const gRPCLogger = pino({ name: 'gRPC' }, generalTransport)
const fcmLogger = pino({ name: 'FCM' }, generalTransport)
const dbLogger = pino({ name: 'MongoDB' }, generalTransport)
const logger = pino({ name: 'General' }, generalTransport)
module.exports = {
  webpushLogger,
  serverLogger,
  queueLogger,
  gRPCLogger,
  fcmLogger,
  dbLogger,
  logger
}
