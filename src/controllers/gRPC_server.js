const { verifyKey } = require('../../utils/encrypt')
const channelPromise = require('../../config/rabbitmq')
const { scheduleMessage } = require('./queue')
const grpc = require('@grpc/grpc-js')
async function authorizeGRPC (call) {
  const metadata = call.metadata.getMap()
  const token = metadata.authorization
  const [success, message] = await verifyKey(token)
  if (!success) {
    console.log(message)
    call.emit('error', {
      code: grpc.status.UNAUTHENTICATED,
      details: message
    })
    call.end()
  }
  return [success, message]
}

async function handleGRPCData (call, notification) {
  try {
    const [, app] = await authorizeGRPC(call)
    if (!notification) return
    const payload = JSON.parse(notification.payload)
    const data = JSON.parse(notification.data)
    if (!payload.appId || payload.appId !== app._id.toString()) {
      console.log('payload: ', payload, app._id.toString())
      call.emit('error', {
        code: grpc.status.UNAUTHENTICATED,
        details: 'The message payload is invalid'
      })
    }
    const message = JSON.stringify({ payload, fcmData: data })
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
