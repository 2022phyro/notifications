/**
 * @file - app.js
 * @description - This file contains the AppModel class for handling database operations. It alows us to manipulate
 *              - the schema to carry out database operations
 * @requires 'mongoose' - for database operations.
 * @requires '../models/app' - for the App schema.
 * @requires '../utils/encrypt' - for encrypting the password and generating api keys.
 * @exports AppModel - as a class for handling database operations.
 */
const App = require('../models/app')
const Message = require('../models/message')
const { BLAccessToken, BLRefreshToken, APIKey } = require('../models/token')
const { encryptPassword, generateSecret } = require('../../utils/encrypt')

/**
 * Represents the AppModel class for handling database operations.
 *
 * @class
 * @classdesc This class represents an AppModel object.
 * @param {string} name - The name of the app.
 * @param {string} email - The email of the app.
 * @param {string} password - The encrypted password of the app.
 * @param {number} notifiLimit - The notification limit of the app.
 * @param {string} secret - The secret of the app for authentication.
 */
function AppModel (name, email, password, phone) {
  this.name = name
  this.email = email
  this.password = encryptPassword(password)
  this.phone = phone
  this.secret = generateSecret()
  this.verified = false
}
/**
 * Creates a new app.
 *
 * @param {Object} appData - The data for the app.
 * @returns {Promise<Object>} - The saved app object.
 */
AppModel.createApp = async function (appData) {
  const appModel = new AppModel(appData.name, appData.email, appData.password, appData.phone)
  const app = new App(appModel)
  const savedApp = await app.save()
  return savedApp
}
/**
 * Retrieves an app based on the provided appId and filters.
 *
 * @param {string} appId - The ID of the app to retrieve.
 * @param {object} filters - Optional filters to apply when retrieving the app.
 * @returns {Promise<object>} - A promise that resolves to the retrieved app.
 */
AppModel.getApp = async function (appId, filters) {
  let query = {}
  if (appId) {
    query._id = appId
  }
  if (filters) {
    query = { ...query, ...filters }
  }
  const app = await App.findOne(query)
  if (!app) return null
  return app.toObject()
}
/**
 * Retrieves apps based on the provided filters.
 *
 * @param {Object} filters - The filters to apply when fetching apps.
 * @returns {Promise<Array>} - A promise that resolves to an array of apps.
 * @throws {Error} - If there is an error while fetching apps.
 */
AppModel.getApps = async function (filters) {
  const apps = await App.find(filters, { password: 0, secret: 0, verified: 0, __v: 0 }).lean().exec()
  return apps
}
/**
 * Updates apps based on the provided filters and by id.
 *
 * @param {Object} filters - The filters to apply when fetching apps.
 * @returns {Promise<Array>} - A promise that resolves to an array of apps.
 */
AppModel.updateApp = async function (appId, appData) {
  if (appData.password) {
    appData.password = encryptPassword(appData.password)
  }

  const app = await App.findById(appId)
  if (!app) return null
  Object.assign(app, appData)
  const updatedApp = await app.save()

  const { secret, password, __v, verified, ...result } = updatedApp.toObject()
  return result
}

/**
 * Deletes an app from the database.
 *
 * @param {string} appId - The ID of the app to be deleted.
 * @returns {Promise<Object>} - A promise that resolves to the deleted app object.
 */
AppModel.deleteApp = async function (appId) {
  const deletedApp = await App.findByIdAndDelete(appId)
  if (!deletedApp) return null
  await Message.deleteMany({ appId })
  await BLAccessToken.deleteMany({ appId })
  await BLRefreshToken.deleteMany({ appId })
  await APIKey.deleteMany({ appId })

  return deletedApp
}
module.exports = AppModel
