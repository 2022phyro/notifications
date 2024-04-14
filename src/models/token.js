const mongoose = require('mongoose')

const BLAccessTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true
  },
  orgId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Org',
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
  orgId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Org',
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

const BLAccessTokenModel = mongoose.model('BLAccessToken', BLAccessTokenSchema)
const BLRefreshTokenModel = mongoose.model('BLRefreshToken', BLRefreshTokenSchema)
const APIKeyModel = mongoose.model('APIKey', APIKeySchema)
module.exports = {
  BLAccessTokenModel,
  BLRefreshTokenModel,
  APIKeyModel
}
