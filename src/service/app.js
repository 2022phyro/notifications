const AppModel = require('../DAO/app')

async function newApp (appData) {
  try {
    const newApp = await AppModel.createApp(appData)
    return newApp
  } catch (err) {
    throw new Error(`Error creating new app, ${err}`)
  }
}

async function getApp (appId, filters) {
  try {
    const app = await AppModel.getApp(appId, filters)
    return app
  } catch (err) {
    throw new Error(`Error getting app, ${err}`)
  }
}

async function getApps (filters) {
  try {
    const apps = await AppModel.getApps(filters)
    return apps
  } catch (err) {
    throw new Error(`Error getting apps, ${err}`)
  }
}

async function updateApp (appId, appData) {
  try {
    const updatedApp = await AppModel.updateApp(appId, appData)
    return updatedApp
  } catch (err) {
    throw new Error(`Error updating app, ${err}`)
  }
}

async function deleteApp (appId) {
  try {
    const deletedApp = await AppModel.deleteApp(appId)
    return deletedApp
  } catch (err) {
    throw new Error(`Error deleting app, ${err}`)
  }
}

module.exports = {
  newApp,
  getApp,
  getApps,
  updateApp,
  deleteApp
}
