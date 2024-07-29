/* eslint-disable eqeqeq */
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const OrgModel = require('../src/models/org')
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
function getJWTTokens (org) {
  const issuedAt = Math.floor(Date.now() / 1000) // current time in seconds since the epoch
  const accessTokenExpiry = issuedAt + 60 * 60 // 1 hour from now
  const refreshTokenExpiry = issuedAt + 60 * 60 * 24 * 7 // 7 days from now

  const payload = {
    sub: org._id,
    orgName: org.name,
    iat: Math.floor(Date.now() / 1000) // current time in seconds since the epoch
  }

  const accessToken = jwt.sign(
    { ...payload, type: 'access' },
    org.secret.slice(0, 16),
    { expiresIn: '1h', algorithm: process.env.SIGNING_ALGORITHM }
  )
  const refreshToken = jwt.sign(
    { ...payload, type: 'refresh' },
    org.secret.slice(0, 16),
    { expiresIn: '7d', algorithm: process.env.SIGNING_ALGORITHM }
  )

  return {
    accessToken,
    refreshToken,
    access_iat: new Date(issuedAt * 1000).toISOString(),
    refresh_iat: new Date(issuedAt * 1000).toISOString(),
    access_exp: new Date(accessTokenExpiry * 1000).toISOString(),
    refresh_exp: new Date(refreshTokenExpiry * 1000).toISOString()
  }
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
    if (!decoded && !(decoded.type == 'refresh')) {
      throw new Error('Invalid refresh token')
    }
    // Get the app
    const org = await OrgModel.findById(decoded.sub)
    if (!org) {
      throw new Error('Organization not found')
    }
    // Verify the old refresh token
    jwt.verify(oldRefreshToken, org.secret.slice(0, 16), {
      algorithms: [process.env.SIGNING_ALGORITHM]
    })

    // Generate new tokens
    const newTokens = getJWTTokens(org)
    await blacklist(decoded.sub, oldRefreshToken, 'refresh')

    return newTokens
  } catch (error) {
    throw new Error('Invalid refresh token')
  }
}
function encrypt (target, secret) {
  const iv = crypto.randomBytes(12)
  const algorithm = process.env.ENCRYPTION
  const key = crypto.scryptSync(secret, 'salt', 32)
  const cipher = crypto.createCipheriv(algorithm, key, iv)
  let encrypted = cipher.update(target, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  const authTag = cipher.getAuthTag().toString('hex')
  return iv.toString('hex') + encrypted + authTag
}

function decrypt (encryptedData, secret) {
  const iv = Buffer.from(encryptedData.slice(0, 24), 'hex')
  const encrypted = encryptedData.slice(24, -32)
  const authTag = Buffer.from(encryptedData.slice(-32), 'hex')
  const algorithm = process.env.ENCRYPTION
  const key = crypto.scryptSync(secret, 'salt', 32)
  const decipher = crypto.createDecipheriv(algorithm, key, iv)
  decipher.setAuthTag(authTag)
  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}
module.exports = {
  encryptPassword,
  getJWTTokens,
  generateSecret,
  refreshTokens,
  verifyPassword,
  encrypt,
  decrypt
}
