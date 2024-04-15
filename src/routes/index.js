const AppRouter = require('./app')
const OrgRouter = require('./org')
const MessageRouter = require('./message')
const APIKeyRouter = require('./apiKeys')
const UserRouter = require('./user')

function addRoutes (app) {
  app.use('/api/v1/apps/:appId/messages', MessageRouter)
  app.use('/api/v1/apps/:appId/keys', APIKeyRouter)
  app.use('/api/v1/apps/:appId/users', UserRouter)
  app.use('/api/v1/apps', AppRouter)
  app.use('/api/v1', OrgRouter)
}

module.exports = addRoutes
