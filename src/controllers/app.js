const AppService = require('../service/app')
const TokenDAO = require('../DAO/token')
const { verifyPassword, getJWTTokens, refreshTokens, generateSecret } = require('../../utils/encrypt')
const vD = require('../../utils/validate')
const rP = require('../../utils/response')
const { createRabbitQueue, updateRabbitQueue, deleteRabbitQueue } = require('../broker/queue')
const channelPromise = require('../../config/rabbitmq')

async function signup (req, res) {
  try {
    const appData = req.body
    vD.validateSchema(appData, vD.appSchema)

    const [stat, err] = vD.validateApp(appData)
    if (!stat) {
      return res.status(400).json(rP.getErrorResponse(400, 'App registration failed', err))
    }

    const app = await AppService.newApp(appData)
    const { channel } = await channelPromise
    await createRabbitQueue(channel, app)
    const tokens = getJWTTokens(app)
    const data = {
      tokens,
      appId: app._id,
      name: app.name
    }
    res.status(201).json(rP.getResponse(201, 'App successfully registered', data))
  } catch (error) {
    res.status(400).json(rP.getErrorResponse(500, 'Internal Server Error', {
      signup: [error.message]
    }))
  }
}

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
    console.log(lstat, err2)
    if (!lstat) errors.password = err2

    if (Object.keys(errors).length > 0) {
      return res.status(400).json(rP.getErrorResponse(400, 'App login failed', errors))
    }
    const app = await AppService.getApp(undefined, { name })
    console.log(app)
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
    console.error(error)
    res.status(400).json(rP.getErrorResponse(500, 'Internal Server Error', {
      login: [error.message]
    }))
  }
}

async function logout (req, res) {
  try {
    const { refresh, all } = req.body
    if (await TokenDAO.isBlacklisted(refresh, 'refresh')) {
      return res.status(400).json(rP.getErrorResponse(400, 'Logout failed', {
        logout: ['Token is blacklisted']
      }))
    }
    if (all === true) {
      await AppService.updateApp(req.app._id, { secret: generateSecret() })
    } else {
      await TokenDAO.blacklist(refresh, 'refresh')
      await TokenDAO.blacklist(req.token, 'access')
    }
    res.status(204).json()
  } catch (error) {
    res.status(400).json(rP.getErrorResponse(500, 'Internal Server Error', {
      logout: [error.message]
    }))
  }
}

async function getApp (req, res) {
  try {
    const app = req.app
    delete app.__v
    delete app.password
    delete app.secret
    delete app.verified
    res.status(200).json(rP.getResponse(200, 'App retrieved successfully', app))
  } catch (error) {
    res.status(400).json(rP.getErrorResponse(500, 'Internal Server Error', {
      lookup: [error.message]
    }))
  }
}

async function patchApp (req, res) {
  try {
    const app = req.app
    const updates = req.body
    vD.validateSchema(updates, vD.appUpdateSchema)

    const [stat, err] = vD.validateApp(updates)
    if (!stat) {
      return res.status(400).json(rP.getErrorResponse(400, 'App update failed', err))
    }

    const updatedApp = await AppService.updateApp(app._id, updates)
    const { channel } = await channelPromise
    await updateRabbitQueue(channel, app.name, updatedApp.name)
    res.status(200).json(rP.getResponse(200, 'App updated successfully', updatedApp))
  } catch (error) {
    res.status(400).json(rP.getErrorResponse(500, 'Internal Server Error', {
      update: [error.message]
    }))
  }
}

async function deleteApp (req, res) {
  try {
    const app = req.app
    const appName = app.name
    await AppService.deleteApp(app._id)
    const { channel } = await channelPromise
    await deleteRabbitQueue(channel, appName)
    res.status(204).json()
  } catch (error) {
    res.status(500).json(rP.getErrorResponse(500, 'Internal Server Error', {
      delete: [error.message]
    }))
  }
}

async function refreshToken (req, res) {
  try {
    const { refresh } = req.body
    const tokens = refreshTokens(refresh)
    res.status(200).json(rP.getResponse(200, 'Refresh token generated', tokens))
  } catch (error) {
    res.status(400).json(rP.getErrorResponse(500, 'Error refreshing token'), {
      refresh: [error.message]
    })
  }
}
// Remember to implement the getApps, verify account, reset password etc

module.exports = {
  signup,
  login,
  logout,
  getApp,
  patchApp,
  deleteApp,
  refreshToken
}
