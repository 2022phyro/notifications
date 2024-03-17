const broker = require('./src/broker/queue')
const channelPromise = require('./config/rabbitmq')
const { saveMsgToDB } = require('./src/controllers/queue')
const express = require('express')
const http = require('http')
// const socketIO = require('socket.io')

const app = express()
const server = http.createServer(app)
// const io = socketIO(server)

async function startConsuming () {
  const channel = await channelPromise
  const apps = [
    { name: 'legos' },
    { name: 'duplo' }
  ]
  await Promise.all(apps.map(app => broker.consumeMessage(channel, app, saveMsgToDB)))
}
startConsuming().catch(console.error)

server.listen(3000, () => {
  console.log('Socket.IO server is running on port 3000')
})
