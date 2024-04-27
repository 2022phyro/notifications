const User = require('../DAO/user')
const App = require('../DAO/app')
const rP = require('../../utils/response')
const vD = require('../../utils/validate')
const { dbLogger } = require('../../utils/logger')
const { getJWTTokens } = require('../../utils/encrypt')

async function subscribe (req, res) {
  try {
    const { userId } = req.params
    const { payload, ...device } = req.body
    vD.validateSchema(device, vD.subscriptionSchema)
    const app = await App.getApp(undefined, { name: payload.appName })
    if (!app) {
      return res
        .status(404)
        .json(rP.getErrorResponse(404, 'User subscription failed', { subscribe: ['App not found'] }))
    }
    await app.populate('orgId')
    const org = app.orgId
    if (App.decrypt(org, app.vapidKeys.publicKey) !== payload.publicKey) {
      return res
        .status(404)
        .json(rP.getErrorResponse(404, 'User subscription failed', { subscribe: ['Invalid vapid key'] }))
    }
    const user = await User.subscribe(userId, app._id, device)
    if (!user) {
      return res
        .status(400)
        .json(rP.getErrorResponse(400, 'User subscription failed', { subscribe: ["User couldn't be subscribed"] }))
    }
    const tokens = getJWTTokens(org)
    res.cookie('refresh', tokens.refreshToken, { maxAge: Number(process.env.MAX_AGE || 86400 * 1000), httpOnly: true }) // Add htttpOnly later on
    return res.status(200).json(rP.getResponse(200, 'User subscribed', {
      _id: user._id,
      dbId: user.dbId,
      deviceCount: user.devices.length,
      tokens
    }))
  } catch (err) {
    if (err.message.startsWith('Validation failed:')) {
      return res
        .status(400)
        .json(rP.getErrorResponse(400, 'User subscription failed', {
          subscribe: [err.message.split(': ')[1]]
        }))
    } else {
      console.error(err)
      dbLogger.error(err)
      return res
        .status(400)
        .json(rP.getErrorResponse(500, 'User subscription failed', {
          subscribe: [err.message]
        }))
    }
  }
}

async function unsubscribe (req, res) {
  try {
    const device = req.body
    const { userId } = req.params
    vD.validateSchema(device, vD.subscriptionSchema)
    const user = await User.unsubscribe(userId, req.app._id, device)
    if (!user) {
      return res
        .status(404)
        .json(rP.getErrorResponse(404, 'User unsubscription failed', { unsubscribe: ['User not found'] }))
    }
    return res.status(200).json(rP.getResponse(200, 'User unsubscribed', {
      _id: user._id,
      dbId: user.dbId,
      deviceCount: user.devices.length
    }))
  } catch (error) {
    if (error.message.startsWith('Validation failed:')) {
      return res
        .status(400)
        .json(rP.getErrorResponse(400, 'User unsubscription failed', {
          unsubscribe: [error.message.split(': ')[1]]
        }))
    } else {
      dbLogger.error(error)
      return res
        .status(400)
        .json(rP.getErrorResponse(500, 'User unsubscription failed', {
          unsubscribe: [error.message]
        }))
    }
  }
}

async function deleteUser (req, res) {
  try {
    const { userId } = req.params
    const user = await User.delete(userId, req.app._id)
    if (!user) {
      return res
        .status(400)
        .json(rP.getErrorResponse(404, 'Not found', { delete: ["User couldn't be found"] }))
    }
    return res.status(204).json()
  } catch (error) {
    dbLogger.error(error)
    return res
      .status(400)
      .json(rP.getErrorResponse(500, 'User deletion failed', {
        delete: [error.message]
      }))
  }
}
async function getUser (req, res) {
  try {
    const { userId } = req.params
    const user = await User.get(userId, req.app._id)
    if (!user) {
      return res
        .status(404)
        .json(rP.getErrorResponse(404, 'User retrieval failed', { get: ['User not found'] }))
    }
    return res.status(200).json(rP.getResponse(200, 'User retrieved', {
      _id: user._id,
      dbId: user.dbId,
      deviceCount: user.devices.length
    }))
  } catch (error) {
    dbLogger.error(error)
    res.status(400).json(rP.getErrorResponse(500, 'Internal Server Error', {
      lookup: [error.message]
    }))
  }
}

module.exports = {
  subscribe,
  unsubscribe,
  deleteUser,
  getUser
}
