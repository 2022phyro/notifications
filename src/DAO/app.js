const AppModel = require('../models/app')
const MessageModel = require('../models/message')
const UserModel = require('../models/user')
const webpush = require('web-push')
const { encryptPassword, generateSecret, encrypt, decrypt } = require('../../utils/encrypt')
const { BLAccessTokenModel, BLRefreshTokenModel, APIKeyModel } = require('../models/token')

const App = {
  /**
   * Creates a new app.
   *
   * @param {Object} appData - The data for the app.
   * @returns {Promise<Object>} - The saved app object.
   */
  async newApp (appData) {
    delete appData.secret
    delete appData.vapidKeys

    const appSecret = generateSecret(32)
    if (appData.password) appData.password = encryptPassword(appData.password)
    // const hashedSecret = encrypt(appSecret, appSecret)
    const { publicKey, privateKey } = webpush.generateVAPIDKeys()
    const hashedpuKey = encrypt(publicKey, appSecret)
    const hashedprKey = encrypt(privateKey, appSecret)
    const vapidKeys = { publicKey: hashedpuKey, privateKey: hashedprKey }
    appData.vapidKeys = vapidKeys
    appData.secret = appSecret
    const app = new AppModel(appData)
    await app.save()
    return app
  },
  /**
   * Retrieves an app based on the provided appId and filters.
   *
   * @param {string} appId - The ID of the app to retrieve.
   * @param {object} filters - Optional filters to apply when retrieving the app.
   * @returns {Promise<object>} - A promise that resolves to the retrieved app.
   */
  async getApp (appId, filters) {
    let query = {}
    if (appId) {
      query._id = appId
    }
    if (filters) {
      query = { ...query, ...filters }
    }
    const app = await AppModel.findOne(query)
    if (!app) return null
    return app
  },
  /**
   * Retrieves apps based on the provided filters.
   *
   * @param {Object} filters - The filters to apply when fetching apps.
   * @returns {Promise<Array>} - A promise that resolves to an array of apps.
   * @throws {Error} - If there is an error while fetching apps.
   */
  async getApps (filters, internal = false) {
    internal = internal || false
    let apps
    if (internal) {
      apps = await AppModel.find(filters).lean().exec()
    } else {
      apps = await AppModel.find(filters, { password: 0, secret: 0, verified: 0, __v: 0, vapidKeys: 0 }).lean().exec()
    }
    return apps
  },
  /**
   * Updates apps based on the provided filters and by id.
   *
   * @param {Object} filters - The filters to apply when fetching apps.
   * @returns {Promise<Array>} - A promise that resolves to an array of apps.
   */
  async updateApp (appId, appData) {
    if (appData.password) {
      appData.password = encryptPassword(appData.password)
    }
    const app = await AppModel.findById(appId)
    if (!app) return null
    Object.assign(app, appData)
    const updatedApp = await app.save()
    const { secret, password, __v, verified, ...result } = updatedApp.toObject()
    return result
  },
  /**
 * Deletes an app from the database.
 *
 * @param {string} appId - The ID of the app to be deleted.
 * @returns {Promise<Object>} - A promise that resolves to the deleted app object.
 */
  async deleteApp (appId) {
    const deletedApp = await AppModel.findByIdAndDelete(appId)
    if (!deletedApp) return null
    await MessageModel.deleteMany({ appId })
    await BLAccessTokenModel.deleteMany({ appId })
    await BLRefreshTokenModel.deleteMany({ appId })
    await APIKeyModel.deleteMany({ appId })
    await UserModel.deleteMany({ appId })
    return deletedApp
  },
  decrypt (app, value) {
    const secret = app.secret
    return decrypt(value, secret)
  },
  /**
   * reEncrypt - reencrypts all of the apps encrypted data
   * @params app The app to be reencrypted
   * @returns String the new secret key
   */
  async reEncrypt (app) {
    const secret = app.secret
    const { publicKey, privateKey } = app.vapidKeys
    const spublicKey = decrypt(publicKey, secret)
    const sprivateKey = decrypt(privateKey, secret)
    const newSecret = generateSecret(32)
    app.vapidKeys = {
      publicKey: encrypt(spublicKey, newSecret),
      privateKey: encrypt(sprivateKey, newSecret)
    }
    app.secret = newSecret
    await app.save()
    return newSecret
  }
}
module.exports = App
