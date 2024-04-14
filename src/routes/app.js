const express = require('express')
const { authenticateJWT } = require('../middleware/auth')

const router = express.Router()

// Import controllers
const AppController = require('../controllers/app')

// Import authentication middleware

// Routes
router.post('', authenticateJWT, AppController.newApp)
router.get('', authenticateJWT, AppController.getApps)
router.get('/:appId', authenticateJWT, AppController.getApp)
router.patch('/:appId', authenticateJWT, AppController.patchApp)
router.delete('/:appId', authenticateJWT, AppController.deleteApp)

module.exports = router
