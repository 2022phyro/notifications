const amqp = require('amqplib')
const loremIpsum = require('lorem-ipsum').loremIpsum

function getRandomAppName (appNames) {
  const randomIndex = Math.floor(Math.random() * appNames.length)
  return appNames[randomIndex]
}

function getRandomText () {
  return loremIpsum({
    count: 1,
    format: 'plain',
    units: 'sentences'
  })
}

async function broadcastMessages (appNames) {
  try {
    const connection = await amqp.connect('amqp://localhost') // Replace with your RabbitMQ server URL
    const channel = await connection.createConfirmChannel()

    const appName = getRandomAppName(appNames)
    const message = {
      name: appName,
      payload: {
        appid: 'your-app-id',
        nType: 'fcm',
        userId: 'your-user-id'
      },
      notification: {
        title: 'Sample title',
        body: getRandomText()
      },
      token: 'jdfcfufsjdgskgfkghagyy2t7'
      // Add other properties as needed
    }

    await channel.assertQueue(appName, { durable: true })
    channel.sendToQueue(appName, Buffer.from(JSON.stringify(message)), { persistent: true }, (err, ok) => {
      if (err) {
        console.error('Message was not received by the server:', err)
      } else {
        console.log(`Message sent to ${appName}`)
      }
    })

    setTimeout(() => { connection.close() }, 500)
  } catch (error) {
    console.error('Error while broadcasting messages:', error)
  }
}

// Usage:
const appNames = ['legos', 'duplo']
for (let i = 0; i < 10; i++) {
  broadcastMessages(appNames)
}