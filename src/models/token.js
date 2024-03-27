const mongoose = require('mongoose')

const BLAccessTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true
  },
  appId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'App',
    required: true
  },
  created: {
    type: Date,
    default: Date.now,
    expiresIn: '1h'
  }
})

const BLRefreshTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true
  },
  appId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'App',
    required: true
  },
  created: {
    type: Date,
    default: Date.now,
    expiresIn: '7d'
  }
})

const APIKeySchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true
  },
  appId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'App',
    required: true
  },
  name: {
    type: String,
    required: true,
    unique: true
  },
  revoked: {
    type: Boolean,
    default: false
  },
  created: {
    type: Date,
    default: Date.now
  },
  expires: {
    type: Date,
    required: true
  }
})

const BLAccessToken = mongoose.model('BLAccessToken', BLAccessTokenSchema)
const BLRefreshToken = mongoose.model('BLRefreshToken', BLRefreshTokenSchema)
const APIKey = mongoose.model('APIKey', APIKeySchema)
module.exports = {
  BLAccessToken,
  BLRefreshToken,
  APIKey
}
