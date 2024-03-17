const AppService = require('../service/app')
const { verifyPassword, getJWTTokens, refreshTokens } = require('../../utils/encrypt')
const vD = require('../../utils/validate')
const rP = require('../../utils/response')
const { createRabbitQueue } = require('../broker/queue')
const channelPromise = require('../../config/rabbitmq')

async function signup (req, res) {
  try {
    const appData = req.body
    vD.validateSchema(appData, vD.appSchema)

    const [stat, err] = vD.validateApp(appData)
    if (!stat) {
      return res.status(400).json(rP.getErrorResponse(400, 'App registration failed', err))
    }

    const app = await AppService.createApp(appData)
    const channel = await channelPromise
    await createRabbitQueue(channel, app)
    const tokens = getJWTTokens(app)
    const data = {
      tokens,
      appId: app._id,
      appName: app.name
    }
    res.status(201).json(rP.getResponse(201, 'App successfully registered', data))
  } catch (error) {
    res.status(500).json(rP.getErrorResponse(500, 'Internal Server Error', {
      signup: [error.message]
    }))
  }
}

async function login (req, res) {
  const errors = {}
  try {
    const { appName, password } = req.body
    if (!appName || !password) {
      return res.status(400).json(rP.getErrorResponse(400, 'App login failed', {
        login: ['Must provide appName and password']
      }))
    }

    const [stat, err] = vD.validateName(appName)
    if (!stat) errors.appName = err
    const [lstat, err2] = vD.validatePwd(password)
    if (!lstat) errors.password = err2

    if (Object.keys(errors).length > 0) {
      return res.status(400).json(rP.getErrorResponse(400, 'App login failed', errors))
    }
    const app = await AppService.getApp({ name: appName })
    if (!app) {
      return res.status(404).json(rP.getErrorResponse(404, 'App not found', { lookup: [`App ${appName} not found`] }))
    }
    if (!verifyPassword(password, app.password)) {
      return res.status(401).json(rP.getErrorResponse(401, 'App login failed', { login: ['Invalid password'] }))
    }
    const tokens = getJWTTokens(app)
    const data = {
      tokens,
      appId: app._id,
      appName: app.name
    }
    res.status(200).json(rP.getResponse(200, 'App login successful', data))
  } catch (error) {
    res.status(500).json(rP.getErrorResponse(500, 'Internal Server Error', {
      login: [error.message]
    }))
  }
}

async function logout (req, res) {
  req.logout()
  res.redirect('/')
}

async function getApp (req, res) {
  try {
    const app = req.app
    res.status(200).json(rP.getResponse(200, 'App retrieved successfully', app))
  } catch (error) {
    res.status(500).json(rP.getErrorResponse(500, 'Internal Server Error', {
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
      return res.status(400).json(rP.getErrorResponse(400, 'App registration failed', err))
    }

    const updatedApp = await AppService.updateApp(app._id, updates)
    res.status(200).json(rP.getResponse(200, 'App updated successfully', updatedApp))
  } catch (error) {
    res.status(500).json(rP.getErrorResponse(500, 'Internal Server Error', {
      update: [error.message]
    }))
  }
}

async function deleteApp (req, res) {
  try {
    const app = req.app
    await AppService.deleteApp(app._id)
    res.status(204).json()
  } catch (error) {
    res.status(500).json(rP.getErrorResponse(500, 'Internal Server Error', {
      delete: [error.message]
    }))
  }
}

// Remember to implement the getApps, verify account, reset password etc
