const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const App = require('../src/models/app')
const { isBlacklisted, blacklist } = require('../src/DAO/token')
function encryptPassword (password, saltRounds = 10) {
  try {
    const salt = bcrypt.genSaltSync(saltRounds)
    return bcrypt.hashSync(password, salt)
  } catch {
    throw new Error('Error while encrypting password')
  }
}
function verifyPassword (password, hash) {
  return bcrypt.compareSync(password, hash)
}

function generateSecret (length = 16) {
  return bcrypt.hashSync(Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15), 10).substring(0, length)
}

function getJWTTokens (app) {
  const payload = {
    sub: app._id,
    appName: app.name,
    iat: Math.floor(Date.now() / 1000) // current time in seconds since the epoch
  }

  const accessToken = jwt.sign({ ...payload, type: 'access' }, app.secret, { expiresIn: '1h', algorithm: 'HS256' })
  const refreshToken = jwt.sign({ ...payload, type: 'refresh' }, app.secret, { expiresIn: '7d', algorithm: 'HS256' })

  return { accessToken, refreshToken }
}

async function refreshTokens (oldRefreshToken) {
  try {
    // Decode the old refresh token
    if (await isBlacklisted(oldRefreshToken, 'refresh')) {
      throw new Error('Token is blacklisted')
    }
    const decoded = jwt.decode(oldRefreshToken)
    if (!decoded && !decoded.type === 'refresh') {
      throw new Error('Invalid refresh token')
    }
    // Get the app
    const app = await App.findById(decoded.sub)
    if (!app) {
      throw new Error('App not found')
    }
    // Verify the old refresh token
    jwt.verify(oldRefreshToken, app.secret, { algorithms: ['HS256'] })

    // Generate new tokens
    const newTokens = getJWTTokens(app)
    await blacklist(oldRefreshToken, 'refresh')

    return newTokens
  } catch (error) {
    throw new Error('Invalid refresh token')
  }
}

module.exports = {
  encryptPassword,
  getJWTTokens,
  generateSecret,
  refreshTokens,
  verifyPassword
}
