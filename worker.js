require('dotenv').config({ path: './config.env' })
const mongoDB = require('./config/db')
const { startSending } = require('./src/controllers/queue')

mongoDB()

startSending().catch(console.error)
