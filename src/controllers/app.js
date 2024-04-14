const App = require('../DAO/app')
const TokenDAO = require('../DAO/token')
const { verifyPassword, getJWTTokens, refreshTokens } = require('../../utils/encrypt')
const vD = require('../../utils/validate')
const rP = require('../../utils/response')
// const { createRabbitQueue, updateRabbitQueue, deleteRabbitQueue } = require('../broker/queue')
// const channelPromise = require('../../config/rabbitmq')
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

    // Validate the app data against the app schema
    vD.validateSchema(appData, vD.appSchema)

    // Validate the app data
    const [isValid, validationErrors] = vD.validateApp(appData)
    if (!isValid) {
      return res
        .status(400)
        .json(rP.getErrorResponse(400, 'App registration failed', validationErrors))
    }

    // Create a new app in the database
    const app = await App.newApp(appData)

    // // Get the RabbitMQ channel from the channelPromise
    // const { channel } = await channelPromise

    // // Create a RabbitMQ queue for the app
    // await createRabbitQueue(channel, app)

    // Generate JWT tokens for the app
    const tokens = getJWTTokens(app)
    // Prepare the response data
    const data = {
      tokens,
      appId: app._id,
      name: app.name
    }
    res.cookie('refresh', tokens.refreshToken, { maxAge: Number(process.env.MAX_AGE), httpOnly: true })
    // Return a 201 response with the registration success message and the response data
    return res
      .status(201)
      .json(rP.getResponse(201, 'App successfully registered', data))
  } catch (error) {
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
    const app = req.app.toObject()
    app.VAPIDKey = App.decrypt(app, app.vapidKeys.publicKey)
    // delete app.__v
    // delete app.password
    // delete app.secret
    // delete app.verified
    const { secret, __v, password, verified, vapidKeys, ...result } = app
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
    const app = req.app.toObject()
    app.VAPIDKey = App.decrypt(app, app.vapidKeys.publicKey)
    // delete app.__v
    // delete app.password
    // delete app.secret
    // delete app.verified
    const { secret, __v, password, verified, vapidKeys, ...result } = app
    res.status(200).json(rP.getResponse(200, 'App retrieved successfully', result))
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
      return res.status(404).json(rP.getErrorResponse(400, 'App registration failed', {
        update: ['App not found']
      }))
    }
    // const { channel } = await channelPromise
    // if (updates.name && app.name !== updates.name) {
    //   await updateRabbitQueue(channel, app.name, updatedApp.name)
    // }
    res.status(200).json(rP.getResponse(200, 'App updated successfully', updatedApp))
  } catch (error) {
    if ([11000, 11001].includes(error.code)) {
      return res.status(400).json(rP.getErrorResponse(400, 'App registration failed', {
        update: ['That name is already taken. Please choose another']
      }))
    } else if (error.message.startsWith('Validation failed:')) {
      return res.status(400).json(rP.getErrorResponse(400, 'App registration failed', {
        update: [error.message.split(': ')[1]]
      }))
    }
    // if (error.startsWith('QueueError')) {
    //   queueLogger.error(error.message, error)
    // }
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
