const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const App = require('../src/models/app')
const { isBlacklisted, blacklist } = require('../src/DAO/token')

/**
 * Encrypts a password using bcrypt.
 *
 * @param {string} password - The password to be encrypted.
 * @param {number} [saltRounds=10] - The number of salt rounds to use for encryption.
 * @returns {string} The encrypted password.
 * @throws {Error} If there is an error while encrypting the password.
 */
function encryptPassword (password, saltRounds = 10) {
  try {
    const salt = bcrypt.genSaltSync(saltRounds)
    return bcrypt.hashSync(password, salt)
  } catch {
    throw new Error('Error while encrypting password')
  }
}

/**
 * Verify if a given password matches a given hash.
 *
 * @param {string} password - The password to be verified.
 * @param {string} hash - The hash to compare the password against.
 * @returns {boolean} - True if the password matches the hash, false otherwise.
 */
function verifyPassword (password, hash) {
  return bcrypt.compareSync(password, hash)
}

/**
 * Generates a secret string of specified length.
 *
 * @param {number} [length=16] - The length of the secret string.
 * @returns {string} - The generated secret string.
 */
function generateSecret (length = 16) {
  return crypto.randomBytes(length).toString('hex')
}

/**
 * Generates JWT tokens for the given app.
 *
 * @param {Object} app - The app object.
 * @param {string} app._id - The ID of the app.
 * @param {string} app.name - The name of the app.
 * @returns {Object} - An object containing the access token and refresh token.
 * @returns {string} - The access token.
 * @returns {string} - The refresh token.
 */
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

/**
 * Refreshes the tokens using the provided old refresh token.
 * @param {string} oldRefreshToken - The old refresh token.
 * @returns {Promise<Object>} - A promise that resolves to an object containing the new tokens.
 * @throws {Error} - If the old refresh token is invalid or blacklisted, or if the app is not found.
 */
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
