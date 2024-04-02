const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  dbId: {
    type: String,
    required: true
  },
  devices: [
    {
      endpoint: {
        type: String,
        required: true
      },
      auth: {
        type: String,
        required: true
      },
      p256dh: {
        type: String,
        required: true
      }
    }
  ],
  appId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'App',
    required: true
  }
})

userSchema.index({ dbId: 1, appId: 1 }, { unique: true })

const UserModel = mongoose.model('User', userSchema)

module.exports = UserModel
