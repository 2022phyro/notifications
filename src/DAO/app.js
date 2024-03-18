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
 * @throws {Error} - If there is an error while creating the app.
 */
AppModel.createApp = async function (appData) {
  try {
    const appModel = new AppModel(appData.name, appData.email, appData.password, appData.phone)
    const app = new App(appModel)
    const savedApp = await app.save()
    return savedApp
  } catch (error) {
    console.error('Error while creating app', error)
    throw new Error('Error while creating app')
  }
}
/**
 * Retrieves an app based on the provided appId and filters.
 *
 * @param {string} appId - The ID of the app to retrieve.
 * @param {object} filters - Optional filters to apply when retrieving the app.
 * @returns {Promise<object>} - A promise that resolves to the retrieved app.
 * @throws {Error} - If there is an error while fetching the app.
 */
AppModel.getApp = async function (appId, filters) {
  let app
  try {
    if (appId) {
      app = await App.findById(appId)
    } else {
      app = App
    }
    if (filters) {
      app = await app.findOne(filters)
    }
    if (!app) return null
    return app.toObject()
  } catch (error) {
    console.error('Error while fetching app', error)
    throw new Error('Error while fetching app')
  }
}
/**
 * Retrieves apps based on the provided filters.
 *
 * @param {Object} filters - The filters to apply when fetching apps.
 * @returns {Promise<Array>} - A promise that resolves to an array of apps.
 * @throws {Error} - If there is an error while fetching apps.
 */
AppModel.getApps = async function (filters) {
  try {
    const apps = await App.find(filters, { password: 0, secret: 0, verified: 0, __v: 0 }).toObject()
    return apps
  } catch (error) {
    console.error('Error while fetching apps', error)
    throw new Error('Error while fetching apps')
  }
}
/**
 * Updates apps based on the provided filters and by id.
 *
 * @param {Object} filters - The filters to apply when fetching apps.
 * @returns {Promise<Array>} - A promise that resolves to an array of apps.
 * @throws {Error} - If there is an error while fetching apps.
 */
AppModel.updateApp = async function (appId, appData) {
  try {
    if (appData.password) {
      appData.password = encryptPassword(appData.password)
    }
    const updatedApp = await App.findByIdAndUpdate(appId, appData, {
      new: true, // Return the updated document
      select: '-secret -password -__v -verified'
    })
    if (!updatedApp) return null
    return updatedApp.toObject()
  } catch (error) {
    console.error('Error while updating app', error)
    throw new Error('Error while updating app')
  }
}
/**
 * Deletes an app from the database.
 *
 * @param {string} appId - The ID of the app to be deleted.
 * @returns {Promise<Object>} - A promise that resolves to the deleted app object.
 * @throws {Error} - If there is an error while deleting the app.
 */
AppModel.deleteApp = async function (appId) {
  try {
    const deletedApp = await App.findByIdAndDelete(appId)
    return deletedApp
  } catch (error) {
    console.error('Error while deleting app', error)
    throw new Error('Error while deleting app')
  }
}
module.exports = AppModel
