const jwt = require('jsonwebtoken')
const AppService = require('../service/app')
async function authenticateJWT (req, res, next) {
  const authHeader = req.headers.authorization
  if (authHeader) {
    const [bearer, token] = authHeader.split(' ')
    const accepted = process.env.BEARER.split(',')
    if (!accepted.includes(bearer) && !token) {
      return res.status(401).json({ message: 'Authentication failed: Invalid token type' })
    }
    try {
      // Decode the token to get the payload without verifying
      const decoded = jwt.decode(token)

      // Get the app
      const app = await AppService.getApp(decoded.sub)
      if (!app) {
        return res.status(401).json({ message: 'Authentication failed: App not found' })
      }
      // Verify the token with the app's secret
      jwt.verify(token, app.secret, { algorithms: ['HS256'] })
      // Add the app to the request
      req.app = app
      next()
    } catch (error) {
      return res.status(401).json({ message: 'Authentication failed: Invalid token' })
    }
  } else {
    return res.status(401).json({ message: 'Authentication failed: No token provided' })
  }
}

module.exports = authenticateJWT
