const jwt = require('jsonwebtoken')
const App = require('../DAO/app')
const TokenDAO = require('../DAO/token')
const { getErrorResponse } = require('../../utils/response')

async function authenticateJWT (req, res, next) {
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
      const app = await App.getApp(decoded.sub)
      if (!app) {
        return res.status(401).json(getErrorResponse(401, 'Authentication failed', { auth: ['App not found'] }))
      }
      // Verify the token with the app's secret
      jwt.verify(token, app.secret.slice(0, 16), { algorithms: ['HS256'] })
      // Add the app to the request
      req.app = app
      req.token = token
      next()
    } catch (error) {
      return res.status(401).json(getErrorResponse(401, 'Authentication failed', { auth: ['Invalid token'] }))
    }
  } else {
    return res.status(401).json(getErrorResponse(401, 'Authentication failed', { auth: ['No token provided'] }))
  }
}

module.exports = {
  authenticateJWT
}
