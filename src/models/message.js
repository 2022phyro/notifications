const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({
  body: {
    type: String,
    required: true
  },
  created: {
    type: Date,
    default: Date.now,
    expires: '20d'
  },
  notifiLimit: {
    type: Number,
    required: true
  },
  appId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'App',
    required: true
  },
  received: {
    type: Boolean,
    default: false
  },
  many: {
    type: Boolean,
    default: false
  },
  receiverCount: {
    type: Number,
    default: 0
  },
  maxRecipents: {
    type: Number,
    default: 0
  },
  recipents: {
    type: Array[String],
    default: []
  }

})

const Message = mongoose.model('Message', messageSchema)

module.exports = Message
