const AppModel = require('../models/app')
const webpush = require('web-push')
const { encryptPassword, generateSecret, encrypt, decrypt } = require('../../utils/encrypt')

const App = {
  /**
   * Creates a new app.
   *
   * @param {Object} appData - The data for the app.
   * @returns {Promise<Object>} - The saved app object.
   */
  async newApp (appData, org) {
    delete appData.secret
    delete appData.vapidKeys
    appData.orgId = org._id
    const { publicKey, privateKey } = webpush.generateVAPIDKeys()
    const hashedpuKey = encrypt(publicKey, org.secret)
    const hashedprKey = encrypt(privateKey, org.secret)
    const vapidKeys = { publicKey: hashedpuKey, privateKey: hashedprKey }
    appData.vapidKeys = vapidKeys
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
  async getApps (filters, org, internal = false) {
    internal = internal || false
    let apps
    if (internal) {
      apps = await AppModel.find(filters).lean().exec()
    } else {
      apps = await AppModel.find(filters, { password: 0, secret: 0, verified: 0, __v: 0 }).sort({ created: -1 }).lean().exec()
      apps = apps.map(app => {
        const { vapidKeys, ...result } = app
        result.publicKey = decrypt(vapidKeys.publicKey, org.secret)
        return result
      })
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
    return deletedApp
  },
  decrypt (org, value) {
    const secret = org.secret
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
