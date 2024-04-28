const grpc = require('@grpc/grpc-js')
const protoLoader = require('@grpc/proto-loader')
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
  }
)

const protoDescriptor = grpc.loadPackageDefinition(packageDefinition)
const NotificationService = protoDescriptor.notification.NotificationService

function init (apiKey, log) {
  log = log || true
  const metadata = new grpc.Metadata()
  metadata.add('authorization', apiKey)
  const client = new NotificationService('0.0.0.0:50051', grpc.credentials.createInsecure())

  if (log) console.log('Started Client')

  return { client, metadata }
}

module.exports = {
  init
}
