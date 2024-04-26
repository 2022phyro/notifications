const { BLAccessTokenModel, BLRefreshTokenModel, APIKeyModel } = require('../models/token')
const crypto = require('crypto')

/**
 * Blacklists a token for a specific org.
 * @param {string} orgId - The ID of the org.
 * @param {string} token - The token to be blacklisted.
 * @param {string} type - The type of the token ('access' or 'refresh').
 * @returns {Promise<boolean>} - A promise that resolves to true if the token was blacklisted successfully, or false otherwise.
 */
async function blacklist (orgId, token, type) {
  try {
    if (type === 'access') {
      const newAccessToken = new BLAccessTokenModel({ token, orgId })
      await newAccessToken.save()
    } else if (type === 'refresh') {
      const newRefreshToken = new BLRefreshTokenModel({ token, orgId })
      await newRefreshToken.save()
    } else {
      throw new Error('Invalid token type')
    }
    return true
  } catch (error) {
    console.error(error)
    return false
  }
}

/**
 * Checks if a token is blacklisted.
 * @param {string} token - The token to check.
 * @param {string} type - The type of token ('access' or 'refresh').
 * @returns {Promise<boolean>} - A promise that resolves to a boolean indicating if the token is blacklisted.
 * @throws {Error} - If an invalid token type is provided.
 */
async function isBlacklisted (token, type) {
  try {
    if (type === 'access') {
      const blacklistedToken = await BLAccessTokenModel.findOne({ token })
      return !!blacklistedToken
    } else if (type === 'refresh') {
      const blacklistedToken = await BLRefreshTokenModel.findOne({ token })
      return !!blacklistedToken
    } else {
      throw new Error('Invalid token type')
    }
  } catch (error) {
    console.error(error)
    return false
  }
}

function APIKey (app, key, name, expires) {
  this.key = key
  this.name = name
  this.appId = app
  this.expires = expires
}

/**
 * Generates a new API key for the specified app.
 *
 * @param {string} app - The ID of the app for which the API key is generated.
 * @param {Date} expires - The expiration date of the API key.
 * @returns {Promise<Object>} - A promise that resolves to the newly generated API key.
 * @throws {Error} - If the API key fails to save after 10 attempts.
 */
APIKey.newKey = async function (app, keyData) {
  const key = crypto.randomBytes(32).toString('hex')
  let name = crypto.randomBytes(7).toString('hex')
  /**
   * Represents the hashed key generated using the SHA256 algorithm.
   *
   * @type {string}
   */
  const hashedKey = crypto.createHash('sha256').update(key).digest('hex')
  let result = new APIKeyModel({ key: hashedKey, name, appId: app, ...keyData })
  let saved = false
  for (let count = 0; count < 10; count++) {
    try {
      await result.save()
      saved = true
      break
    } catch (error) {
      if (error.code && error.code === 11000) {
        name = crypto.randomBytes(7).toString('hex')
        result = new APIKeyModel({ key: hashedKey, name, appId: app, ...keyData })
      } else {
        throw error
      }
    }
  }
  if (!saved) {
    throw new Error('Failed to save API key after 10 attempts')
  }
  result.key = name + '_' + key
  return result
}

/**
 * Retrieves all API keys associated with a specific app ID.
 *
 * @param {string} appId - The ID of the app.
 * @returns {Promise<Array>} - A promise that resolves to an array of API keys.
 */
APIKey.allKeys = async function (appId) {
  const result = await APIKeyModel.find({ appId }, { key: 0, __v: 0, _id: 0 }).sort({ created: -1 }).lean().exec()
  return result
}

/**
 * Revoke a key.
 *
 * @param {string} name - The name of the key to revoke.
 * @returns {Promise<Object|null>} - The revoked key object, or null if the key was not found.
 * @throws {Error} - If there was an error saving the key.
 */
APIKey.revokeKey = async function (name, appId) {
  const revokedKey = await APIKeyModel.findOneAndUpdate({ name, appId }, { revoked: true, lastUsed: new Date() }, { new: true })
  if (!revokedKey) return null
  const { __v, __id, key, ...result } = revokedKey.toObject()
  // key.revoked = true
  // await key.save()
  return result
}

/**
 * Deletes an API key with the given name.
 *
 * @param {string} name - The name of the API key to delete.
 * @returns {Promise<Object|null>} - A promise that resolves to the deleted API key object, or null if the key was not found.
 * @throws {Error} - If there was an error while deleting the API key.
 */
APIKey.deleteKey = async function (name, appId) {
  const key = await APIKeyModel.findOneAndDelete({ name, appId })
  if (!key) return null
  return key
}

/**
 * Verifies the validity of an API key.
 *
 * @param {string} token - The API key token to be verified.
 * @returns {Object} - An object containing the verification result.
 *                    - success: A boolean indicating whether the key is valid or not.
 *                    - message: A string describing the result of the verification.
 *                               Possible values: 'API key not found', 'Invalid key',
 *                               'API key revoked', 'API key expired', 'App not found'.
 */
APIKey.verifyKey = async function (token) {
  const [name, key] = token.split('_')
  const hashedKey = crypto.createHash('sha256').update(key).digest('hex')
  const apiKey = await APIKeyModel.findOne({ name })
  if (!apiKey) {
    return { success: false, message: 'API key not found' }
  }
  if (apiKey.key !== hashedKey) {
    return { success: false, message: 'Invalid key' }
  }
  if (apiKey.revoked) {
    return { success: false, message: 'API key revoked' }
  }
  if (apiKey.expires < new Date()) {
    return { success: false, message: 'API key expired' }
  }
  await apiKey.populate('appId')
  const app = apiKey.appId
  if (!app) {
    return { success: false, message: 'App not found' }
  }
  apiKey.lastUsed = new Date()
  await apiKey.save()
  return { success: true, message: app }
}

module.exports = {
  blacklist,
  isBlacklisted,
  APIKey
}
