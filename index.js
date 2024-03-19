const broker = require('./src/broker/queue')
const channelPromise = require('./config/rabbitmq')
const mongoDB = require('./config/db')
const { startConsuming } = require('./src/controllers/queue')
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express')
const YAML = require('js-yaml')
const fs = require('fs')
const AppRouter = require('./src/routes/app')
require('dotenv').config({ path: './config.env' })


// ...

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 200 // limit each IP to 200 requests per windowMs
});

//  apply to all requests
const swaggerDocument = YAML.load(fs.readFileSync('./swagger/docs.yaml', 'utf8'))
const app = express()
app.set('trust proxy', 1)
app.use(limiter)
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cors())
app.use(helmet())

// Routes
app.use('/api/v1', AppRouter)
app.use('/api/v1/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})
mongoDB()
app.listen(3000, () => {
  console.log('Express server is running on port 3000')
})

startConsuming().catch(console.error)
