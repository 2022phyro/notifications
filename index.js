const broker = require('./src/broker/queue')
const channelPromise = require('./config/rabbitmq')
const mongoDB = require('./config/db')
const { saveMsgToDB } = require('./src/controllers/queue')
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const swaggerUi = require('swagger-ui-express')
const YAML = require('js-yaml')
const fs = require('fs')
const AppRouter = require('./src/routes/app')
require('dotenv').config({ path: './config.env' })

const swaggerDocument = YAML.load(fs.readFileSync('./swagger/docs.yaml', 'utf8'))
const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cors())
app.use(helmet())

// Routes
app.use('/api/v1', AppRouter)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})
mongoDB()
app.listen(3000, () => {
  console.log('Express server is running on port 3000')
})

async function startConsuming () {
  const channel = await channelPromise
  const apps = [
    { name: 'legos' },
    { name: 'duplo' }
  ]
  await Promise.all(apps.map(app => broker.consumeMessage(channel, app, saveMsgToDB)))
}
startConsuming().catch(console.error)
