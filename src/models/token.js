const mongoose = require('mongoose')

const BLAccessTokenSchema = new mongoose.Schema({
  token: {
    type: String,
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
  created: {
    type: Date,
    default: Date.now,
    expiresIn: '7d'
  }
})

const BLAccessToken = mongoose.model('BLAccessToken', BLAccessTokenSchema)
const BLRefreshToken = mongoose.model('BLRefreshToken', BLRefreshTokenSchema)

module.exports = {
  BLAccessToken,
  BLRefreshToken
}
