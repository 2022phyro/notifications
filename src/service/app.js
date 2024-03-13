const AppModel = require('../DAO/app')
const broker = require('../broker/queue')

async function registerApp (appData) {
  try {
    const newApp = await AppModel.createApp(appData)
    await broker.createRabbitQueue(newApp)
    return newApp
  } catch (error) {
    console.error('Error in registering new app', error)
    throw error
  }
}

async function getApp (id, filters) {
  return await AppModel.getApp(id, filters)
}

async function getApps (filters) {
  return await AppModel.getApps(filters)
}

async function updateApp (id, appData) {
  try {
    const app = await AppModel.getApp(id)
    if (!app) {
      throw new Error('App not found')
    }
    if (appData.name && app.name !== appData.name) {
      await broker.updateRabbitQueue(app.name, appData.name)
    }
    return await AppModel.updateApp(id, appData)
  } catch (err) {
    console.error('Error in updating app', err)
    throw err
  }
}

async function deleteApp (id) {
  try {
    const app = await AppModel.getApp(id)
    if (!app) {
      throw new Error('App not found')
    }
    await broker.deleteRabbitQueue(app)
    return await AppModel.deleteApp(id)
  } catch (err) {
    console.error('Error in deleting app', err)
    throw err
  }
}

module.exports = {
  registerApp,
  getApp,
  getApps,
  updateApp,
  deleteApp
}
