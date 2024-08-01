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
  const client = new NotificationService('notifai.futurdevs.tech', grpc.ChannelCredentials.createSsl())

  if (log) console.log('Started Client')

  return { client, metadata }
}

module.exports = {
  init
}
