const { APIKeyModel } = require('../models/token')
const MessageModel = require('../models/message')
const UserModel = require('../models/user')

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
  orgId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Org',
    required: true
  },
  vapidKeys: {
    type: Object,
    required: true
  }
})
appSchema.post('findOneAndRemove', async function (doc) {
  if (doc._id) {
    await MessageModel.deleteMany({ appId: doc._id })
    await APIKeyModel.deleteMany({ appId: doc._id })
    await UserModel.deleteMany({ appId: doc._id })
  }
})
const AppModel = mongoose.model('App', appSchema)

module.exports = AppModel
