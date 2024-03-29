const grpc = require('@grpc/grpc-js')
const protoLoader = require('@grpc/proto-loader')
const mongoDB = require('../../config/db')
const { gRPCLogger } = require('../../utils/logger')
const { handleGRPCData } = require('../controllers/gRPC_server')
const path = require('path')
const baseDir = path.resolve(__dirname, './')
const PROTO_PATH = path.join(baseDir, 'notification.proto')

const packageDefinition = protoLoader.loadSync(
  PROTO_PATH,
  {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
  })

const protoDescriptor = grpc.loadPackageDefinition(packageDefinition)
const NotificationService = protoDescriptor.notification.NotificationService

const server = new grpc.Server()

const serviceImpl = {
  sendNotification: function (call) {
    call.on('data', async (notification) => {
      await handleGRPCData(call, notification)
    })

    call.on('end', () => {
      call.end()
    })
  }
}
mongoDB()
server.addService(NotificationService.service, serviceImpl)
server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
  gRPCLogger.info('Server started on port 50051')
})
