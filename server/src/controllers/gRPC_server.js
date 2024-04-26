const { APIKey } = require('../DAO/token')
const channelPromise = require('../../config/rabbitmq')
const { scheduleMessage } = require('./queue')
const grpc = require('@grpc/grpc-js')
const { gRPCLogger } = require('../../utils/logger')
async function authorizeGRPC (call) {
  const metadata = call.metadata.getMap()
  const token = metadata.authorization
  const { success, message } = await APIKey.verifyKey(token)
  gRPCLogger.info('Connection established with a client')
  if (!success) {
    console.log(message)
    call.emit('error', {
      code: grpc.status.UNAUTHENTICATED,
      details: message
    })
    call.end()
  }
  return { success, message }
}

async function handleGRPCData (call, notification) {
  try {
    let { success, message } = await authorizeGRPC(call)
    if (!success) return
    const app = message
    if (!notification) return
    const payload = JSON.parse(notification.payload)
    const data = JSON.parse(notification.data)
    if (!payload.appId || payload.appId !== app._id.toString()) {
      call.emit('error', {
        code: grpc.status.UNAUTHENTICATED,
        details: 'The message payload is invalid'
      })
    }
    message = JSON.stringify({ payload, notification: data })
    const { confirmChannel } = await channelPromise
    await scheduleMessage(confirmChannel, message)
    call.write({ success: true, message: 'Message successfully delivered' })
  } catch (err) {
    console.error(err)
    call.emit('error', {
      code: grpc.status.UNKNOWN,
      details: 'Error: ' + err.message
    })
  }
}
module.exports = {
  authorizeGRPC,
  handleGRPCData
}
