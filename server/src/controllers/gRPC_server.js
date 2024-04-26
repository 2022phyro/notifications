const { APIKey } = require('../DAO/token')
const channelPromise = require('../../config/rabbitmq')
const { scheduleMessage } = require('./queue')
const grpc = require('@grpc/grpc-js')
const { gRPCLogger } = require('../../utils/logger')
const { GRPCError } = require('../../utils/errors')

async function authorizeGRPC (call) {
  const metadata = call.metadata.getMap()
  const token = metadata.authorization
  const { success, message } = await APIKey.verifyKey(token)
  gRPCLogger.info(`Connection established with client ${metadata.clientId}`)
  return { success, message }
}

async function handleGRPCData (call) {
  let { success, message } = await authorizeGRPC(call)
  if (!success) {
    throw new GRPCError(
      grpc.status.UNAUTHENTICATED,
      message
    )
  }
  const app = message
  const notification = call.request
  if (!notification) {
    throw new GRPCError(
      grpc.status.INVALID_ARGUMENT,
      'No notification provided'
    )
  }
  const payload = JSON.parse(notification.payload)
  const data = JSON.parse(notification.data)
  if (!payload.appId || payload.appId !== app._id.toString()) {
    throw new GRPCError(
      grpc.status.UNAUTHENTICATED,
      'The message payload is invalid'
    )
  }
  message = JSON.stringify({ payload, notification: data })
  const { confirmChannel } = await channelPromise
  await scheduleMessage(confirmChannel, message)
  return { success: true, message: 'Message successfully delivered' }
}
module.exports = {
  authorizeGRPC,
  handleGRPCData
}
