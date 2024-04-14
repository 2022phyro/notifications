const jwt = require('jsonwebtoken')
const Org = require('../DAO/org')
const App = require('../DAO/app')
const TokenDAO = require('../DAO/token')
const mongoose = require('mongoose')
const { getErrorResponse } = require('../../utils/response')

async function authenticateJWT (req, res, next) {
  const { appId } = req.params
  const authHeader = req.headers.authorization
  if (authHeader) {
    const [bearer, token] = authHeader.split(' ')
    const accepted = process.env.BEARER.split(',')
    if (!accepted.includes(bearer) && !token) {
      return res.status(401).json(getErrorResponse(401, 'Authentication failed', { auth: ['Invalid token'] }))
    }
    if (await TokenDAO.isBlacklisted(token, 'access')) {
      return res.status(401).json(getErrorResponse(401, 'Authentication failed', { auth: ['Token is blacklisted'] }))
    }
    try {
      // Decode the token to get the payload without verifying
      const decoded = jwt.decode(token)

      // Get the app
      const org = await Org.get(decoded.sub)
      if (!org) {
        return res.status(401).json(getErrorResponse(401, 'Authentication failed', { auth: ['Organization not found'] }))
      }
      // Verify the token with the app's secret
      jwt.verify(token, org.secret.slice(0, 16), { algorithms: ['HS256'] })
      // Add the app to the request
      req.org = org
      req.token = token
      if (appId) {
        try {
          const app = await App.getApp(appId)
          if (!app) {
            return res.status(401).json(getErrorResponse(404, 'Not found', { auth: ['App not found'] }))
          }
          req.app = app
        } catch (error) {
          if (error instanceof mongoose.Error.CastError) {
            return res.status(400).json(getErrorResponse(400, 'Bad Request', { auth: ['Invalid App ID'] }))
          }
          console.error(error)
          return res.status(500).json(getErrorResponse(500, 'Internal Server Error', { auth: ['Unexpected error'] }))
        }
      }

      next()
    } catch (error) {
      console.error(error)
      return res.status(401).json(getErrorResponse(401, 'Authentication failed', { auth: ['Invalid token'] }))
    }
  } else {
    return res.status(401).json(getErrorResponse(401, 'Authentication failed', { auth: ['No token provided'] }))
  }
}

module.exports = {
  authenticateJWT
}
