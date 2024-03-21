require('dotenv').config({ path: './config.env' })
const { startSending } = require('./src/controllers/queue')

startSending().catch(console.error)
