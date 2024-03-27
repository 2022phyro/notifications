const express = require('express')
const { authenticateJWT } = require('../middleware/auth')

const router = express.Router()

// Import controllers
const APIKeyController = require('../controllers/apiKeys')

// Import authentication middleware

// Routes
router.post('/keys', authenticateJWT, APIKeyController.createAPIKey)
router.get('/keys', authenticateJWT, APIKeyController.listAPIKeys)
router.post('/keys/:name/revoke', authenticateJWT, APIKeyController.revokeAPIKey)
router.delete('/keys/:name', authenticateJWT, APIKeyController.deleteAPIKey)

module.exports = router
