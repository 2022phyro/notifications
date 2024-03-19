const mongoose = require('mongoose')
const App = require('./app')

const messageSchema = new mongoose.Schema({
  created: {
    type: Date,
    default: Date.now,
    expires: '20d'
  },
  appId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'App',
    required: true
  },
  nType: {
    type: String,
    required: true
  },
  userId: {
    type: String
  },
  read: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    default: 'PENDING'
  },
  value: {
    type: Object,
    required: true
  }
})

messageSchema.pre('save', async function (next) {
  if (!mongoose.Types.ObjectId.isValid(this.appId)) {
    throw new Error('Invalid appId')
  }
  const app = await App.findById(this.appId)
  if (!app) {
    throw new Error('App doesn\'t exist')
  }
  next()
})

const Message = mongoose.model('Message', messageSchema)

module.exports = Message
