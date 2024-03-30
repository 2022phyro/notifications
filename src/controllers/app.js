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
async function signup (req, res) {
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
 * Logs in the user with the provided credentials.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the login process is complete.
 * @throws {Error} - If an error occurs during the login process.
 */
async function login (req, res) {
  const errors = {}
  try {
    const { name, password } = req.body
    if (!name || !password) {
      return res.status(400).json(rP.getErrorResponse(400, 'App login failed', {
        login: ['Must provide name and password']
      }))
    }

    const [stat, err] = vD.validateName(name)
    if (!stat) errors.name = err
    const [lstat, err2] = vD.validatePwd(password)
    if (!lstat) errors.password = err2

    if (Object.keys(errors).length > 0) {
      return res.status(400).json(rP.getErrorResponse(400, 'App login failed', errors))
    }
    const app = await App.getApp(undefined, { name })
    if (!app) {
      return res.status(404).json(rP.getErrorResponse(404, 'App not found', { lookup: [`App ${name} not found`] }))
    }
    if (!verifyPassword(password, app.password)) {
      return res.status(401).json(rP.getErrorResponse(401, 'App login failed', { login: ['Invalid password'] }))
    }
    const tokens = getJWTTokens(app)
    const data = {
      tokens,
      appId: app._id,
      name: app.name
    }
    res.status(200).json(rP.getResponse(200, 'App login successful', data))
  } catch (error) {
    dbLogger.error(error)
    res.status(400).json(rP.getErrorResponse(500, 'Internal Server Error', {
      signup: [error.message]
    }))
  }
}

/**
 * Logs out the user by blacklisting the provided refresh token and access token.
 * If the 'all' parameter is true, it also generates a new secret for the app.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the logout process is complete.
 * @throws {Error} - If an error occurs during the logout process.
 */
async function logout (req, res) {
  try {
    const { refresh, all } = req.body
    if (!(refresh || (refresh && all))) {
      return res.status(400).json(rP.getErrorResponse(400, 'Logout failed', {
        logout: ['Must provide refresh token and all']
      }))
    }
    if (await TokenDAO.isBlacklisted(refresh, 'refresh')) {
      return res.status(400).json(rP.getErrorResponse(400, 'Logout failed', {
        logout: ['Token is blacklisted']
      }))
    }
    if (all) {
      await App.reEncrypt(req.app)
    } else {
      await TokenDAO.blacklist(req.app._id, refresh, 'refresh')
      await TokenDAO.blacklist(req.app._id, req.token, 'access')
    }
    res.status(204).json()
  } catch (error) {
    dbLogger.error(error)
    res.status(400).json(rP.getErrorResponse(500, 'Internal Server Error', {
      logout: [error.message]
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

/**
 * Refreshes the access token using the provided refresh token.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the token is refreshed.
 */
async function refreshToken (req, res) {
  try {
    const { refresh } = req.body
    const tokens = refreshTokens(refresh)
    res.status(200).json(rP.getResponse(200, 'Refresh token generated', tokens))
  } catch (error) {
    res.status(400).json(rP.getErrorResponse(400, 'Error refreshing token'), {
      refresh: [error.message]
    })
  }
}

module.exports = {
  signup,
  login,
  logout,
  getApp,
  patchApp,
  deleteApp,
  refreshToken
}
