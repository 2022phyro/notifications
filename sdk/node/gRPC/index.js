const grpc = require('@grpc/grpc-js')
const protoLoader = require('@grpc/proto-loader')
const PROTO_PATH = './notification.proto'

let call;
let timeoutId;
let TIMEOUT_LIMIT = 10 * 60 * 1000
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

function resetTime() {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
        if (call) call.end();
        call = null;
    }, TIMEOUT_LIMIT)
}

function init (apiKey, log) {
    if (call) {
        return call;
    }
    log = log || true
    const metadata = new grpc.Metadata()
    metadata.add('authorization', apiKey)
    const client = new NotificationService('notifai.allcanlearn.me', grpc.ChannelCredentials.createSsl())
    if (log) console.log('Started Client')
    call = client.sendNotification(meta = metadata)

    resetTime()
    return call
}

module.exports = {
    init
}