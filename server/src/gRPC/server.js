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

const serviceImpl = {
  sendNotification: async (call, callback) => {
    try {
      const response = await handleGRPCData(call)
      callback(null, { success: true, message: response })
    } catch (err) {
      callback(err)
    }
  }
}
mongoDB()
const server = new grpc.Server()
server.addService(NotificationService.service, serviceImpl)
server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
  gRPCLogger.info('Server started on port 50051')
})
