const mongoose = require('mongoose')
// const AppModel = require('./app')

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
  },
  retries: {
    type: Number,
    default: 0
  }
})

messageSchema.pre('save', async function (next) {
  if (!mongoose.Types.ObjectId.isValid(this.appId)) {
    throw new Error('Invalid appId')
  }
  // const app = await AppModel.findById(this.appId)
  // if (!app) {
  //   throw new Error('App doesn\'t exist')
  // }
  next()
})

const MessageModel = mongoose.model('Message', messageSchema)

module.exports = MessageModel
