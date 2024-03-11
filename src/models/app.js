const mongoose = require('mongoose')

const appSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  created: {
    type: Date,
    default: Date.now
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  secret: {
    type: String,
    required: true,
    unique: true
  },
  notifiLimit: {
    type: Number,
    required: true,
    default: 20
  }
})

const App = mongoose.model('App', appSchema)

module.exports = App
