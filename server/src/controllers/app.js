const App = require('../DAO/app')
const { decrypt } = require('../../utils/encrypt')
const vD = require('../../utils/validate')
const rP = require('../../utils/response')
const { dbLogger } = require('../../utils/logger')
/**
 * Registers a new app.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise} - A promise that resolves to the response object.
 *
 * @throws {Error} - If the app registration fails.
 * @throws {Error} - If the app name already exists.
 * @throws {Error} - If the app data validation fails.
 * @throws {Error} - If there is an internal server error.
 */
async function newApp (req, res) {
  try {
    const appData = req.body
    vD.validateSchema(appData, vD.appSchema)
    const [isValid, validationErrors] = vD.validateApp(appData)
    if (!isValid) {
      return res
        .status(400)
        .json(rP.getErrorResponse(400, 'App registration failed', validationErrors))
    }
    const app = await App.newApp(appData, req.org)
    const { vapidKeys, __v, ...result } = app.toObject()
    result.publicKey = decrypt(vapidKeys.publicKey, req.org.secret)
    return res
      .status(201)
      .json(rP.getResponse(201, 'App successfully registered', result))
  } catch (error) {
    console.error(error)
    if ([11000, 11001].includes(error.code)) {
      return res
        .status(400)
        .json(rP.getErrorResponse(400, 'App registration failed', {
          signup: ['App with that name already exists']
        }))
    } else if (error.message.startsWith('Validation failed:')) {
      return res
        .status(400)
        .json(rP.getErrorResponse(400, 'App registration failed', {
          signup: [error.message.split(': ')[1]]
        }))
    }

    dbLogger.error(error)

    return res
      .status(400)
      .json(rP.getErrorResponse(500, 'Internal Server Error', {
        signup: [error.message]
      }))
  }
}

/**
 * Retrieves an app.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the app is retrieved successfully.
 */
async function getApp (req, res) {
  try {
    const { vapidKeys, __v, ...result } = req.app.toObject()
    result.publicKey = decrypt(vapidKeys.publicKey, req.org.secret)
    res.status(200).json(rP.getResponse(200, 'App retrieved successfully', result))
  } catch (error) {
    dbLogger.error(error)
    res.status(400).json(rP.getErrorResponse(500, 'Internal Server Error', {
      lookup: [error.message]
    }))
  }
}

async function getApps (req, res) {
  try {
    const apps = await App.getApps({ orgId: req.org._id }, false, req.org)
    res.status(200).json(rP.getResponse(200, 'App retrieved successfully', apps))
  } catch (error) {
    dbLogger.error(error)
    res.status(400).json(rP.getErrorResponse(500, 'Internal Server Error', {
      lookup: [error.message]
    }))
  }
}
/**
 * Updates an app with the provided data.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the app is updated.
 * @throws {Error} - If there is an error during the update process.
 */
async function patchApp (req, res) {
  try {
    const app = req.app
    const updates = req.body
    vD.validateSchema(updates, vD.appUpdateSchema)

    const [stat, err] = vD.validateApp(updates)
    if (!stat) {
      return res.status(400).json(rP.getErrorResponse(400, 'App update failed', err))
    }

    const updatedApp = await App.updateApp(app._id, updates)
    if (!updatedApp) {
      return res.status(404).json(rP.getErrorResponse(400, 'App update failed', {
        update: ['App not found']
      }))
    }
    const { vapidKeys, ...result } = updatedApp
    result.publicKey = decrypt(vapidKeys.publicKey, req.org.secret)
    return res.status(200).json(rP.getResponse(200, 'App updates successfully', result))
  } catch (error) {
    if ([11000, 11001].includes(error.code)) {
      return res.status(400).json(rP.getErrorResponse(400, 'App update failed', {
        update: ['That name is already taken. Please choose another']
      }))
    } else if (error.message.startsWith('Validation failed:')) {
      return res.status(400).json(rP.getErrorResponse(400, 'App update failed', {
        update: [error.message.split(': ')[1]]
      }))
    }

    dbLogger.error(error.message, error)
    res.status(400).json(rP.getErrorResponse(500, 'Internal Server Error', {
      update: [error.message]
    }))
  }
}

/**
 * Deletes an app.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the app is deleted.
 * @throws {Error} - If there is an error deleting the app.
 */
async function deleteApp (req, res) {
  try {
    const app = req.app
    const deleted = await App.deleteApp(app._id)
    if (!deleted) {
      return res.status(404).json(rP.getErrorResponse(404, 'App deletion failed', {
        delete: ['App not found']
      }))
    }
    res.status(204).json()
    // const { channel } = await channelPromise
    // await deleteRabbitQueue(channel, appName)
  } catch (error) {
    // if (error.startsWith('QueueError')) {
    //   queueLogger.error(error.message, error)
    // }
    dbLogger.error(error.message, error)
    res.status(500).json(rP.getErrorResponse(500, 'Internal Server Error', {
      delete: [error.message]
    }))
  }
}

module.exports = {
  newApp,
  getApp,
  patchApp,
  deleteApp,
  getApps
}
