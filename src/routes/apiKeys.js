const express = require('express')
const { authenticateJWT } = require('../middleware/auth')

const router = express.Router({ mergeParams: true })

// Import controllers
const APIKeyController = require('../controllers/apiKeys')

// Import authentication middleware

// Routes
router.post('', authenticateJWT, APIKeyController.createAPIKey)
router.get('', authenticateJWT, APIKeyController.listAPIKeys)
router.post('/:name/revoke', authenticateJWT, APIKeyController.revokeAPIKey)
router.delete('/:name', authenticateJWT, APIKeyController.deleteAPIKey)

module.exports = router
