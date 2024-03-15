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
  appId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'App',
    required: true
  },
  recipents: [{
    id: {
      type: String,
      required: true
    },
    seen: {
      type: Boolean,
      default: false
    }
  }],
  slug: {
    type: String,
    required: true,
    unique: true
  }
})

const Message = mongoose.model('Message', messageSchema)

module.exports = Message
