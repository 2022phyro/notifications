const mongoDB = require('./config/db')
const { startSending } = require('./src/controllers/queue')
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const swaggerUi = require('swagger-ui-express')
const YAML = require('js-yaml')
const fs = require('fs')
const AppRouter = require('./src/routes/app')
const MessageRouter = require('./src/routes/message')
const APIKeyRouter = require('./src/routes/apiKeys')
const UserRouter = require('./src/routes/user')
const expressPino = require('pino-http')
const { serverLogger, logger } = require('./utils/logger')
require('dotenv').config()

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 200 // limit each IP to 200 requests per windowMs
})

const swaggerDocument = YAML.load(fs.readFileSync('./swagger/docs.yaml', 'utf8'))
const expressLogger = expressPino({ logger: serverLogger })

const app = express()
app.set('trust proxy', 1)
app.use(limiter)
app.use(expressLogger)
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cors())
app.use(helmet())

app.use('/api/v1', AppRouter)
app.use('/api/v1/app', MessageRouter)
app.use('/api/v1/app/', APIKeyRouter)
app.use('/api/v1/app/', UserRouter)
app.use('/api/v1/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})
mongoDB()
app.listen(3000, () => {
  logger.child({ name: 'Express' }).info('Express server is running on port 3000')
})
startSending().catch(console.error)
