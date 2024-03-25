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
      payload: {
        appId: '65f82af5ffac2ba844579770',
        nType: 'fcm',
        userId: 'your-user-id'
      },
      fcmData: {
        notification: {
          title: 'Sample title',
          body: getRandomText()
        },
        token: 'ewyObwixZRThIMQbsy54mv:APA91bG2fa8NcXEtlGKbVDPEyrFkRnJdfiu_a-6vP8LowBAzomB1Sb4oYydpkwk-G4_pzWkgOIip0w8WU8l8Q_RpkYh1sd99_Oh0-x_P3uFW0-fbv0DBQAsg0InKKDSEbF59BSa3qe3a',
        name: 'poeticverse'
      }
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
const appNames = ['poeticverse']
for (let i = 0; i < 5; i++) {
  broadcastMessages(appNames)
}
