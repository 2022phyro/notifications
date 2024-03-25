/**
 * This module exports several async functions for interacting with an app model.
 *
 * @module appFunctions
 * @exports {Function} newApp - Creates a new app using the provided app data.
 * @exports {Function} getApp - Retrieves an app based on the provided appId and filters.
 * @exports {Function} getApps - Retrieves a list of apps based on the provided filters.
 * @exports {Function} updateApp - Update an app with the given appId and appData.
 * @exports {Function} deleteApp - Deletes an app with the specified appId.
 */
const AppModel = require('../DAO/app')

/**
 * Creates a new app using the provided app data.
 *
 * @param {Object} appData - The data for the new app.
 * @returns {Promise<Object>} - A promise that resolves to the newly created app.
 * @throws {Error} - If there is an error creating the app.
 */
async function newApp (appData) {
  const newApp = await AppModel.createApp(appData)
  return newApp
}
/**
 * Retrieves an app based on the provided appId and filters.
 *
 * @param {string} appId - The ID of the app to retrieve.
 * @param {object} filters - Optional filters to apply to the app retrieval.
 * @returns {Promise<object>} - A promise that resolves to the retrieved app.
 */
async function getApp (appId, filters) {
  const app = await AppModel.getApp(appId, filters)
  return app
}

/**
 * Retrieves a list of apps based on the provided filters.
 *
 * @param {Object} filters - The filters to apply when retrieving the apps.
 * @returns {Promise<Array>} - A promise that resolves to an array of apps.
 */
async function getApps (filters) {
  const apps = await AppModel.getApps(filters)
  return apps
}

/**
 * Update an app with the given appId and appData.
 *
 * @param {string} appId - The ID of the app to be updated.
 * @param {object} appData - The updated data for the app.
 * @returns {Promise<object>} - A promise that resolves to the updated app.
 */
async function updateApp (appId, appData) {
  const updatedApp = await AppModel.updateApp(appId, appData)
  return updatedApp
}

/**
 * Deletes an app with the specified appId.
 *
 * @param {string} appId - The ID of the app to be deleted.
 * @returns {Promise<Object>} - A promise that resolves to the deleted app object.
 * @throws {Error} - If there is an error deleting the app.
 */
async function deleteApp (appId) {
  const deletedApp = await AppModel.deleteApp(appId)
  return deletedApp
}

module.exports = {
  newApp,
  getApp,
  getApps,
  updateApp,
  deleteApp
}
