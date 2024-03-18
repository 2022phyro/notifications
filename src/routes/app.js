const express = require('express')
const { authenticateJWT } = require('../middleware/auth')

const router = express.Router()

// Import controllers
const AppController = require('../controllers/app')

// Import authentication middleware

// Routes
router.post('/signup', AppController.signup)
router.post('/login', AppController.login)
router.post('/logout', authenticateJWT, AppController.logout)
router.post('/refresh', AppController.refreshToken)
router.get('/app', authenticateJWT, AppController.getApp)
router.patch('/app', authenticateJWT, AppController.patchApp)
router.delete('/app', authenticateJWT, AppController.deleteApp)

module.exports = router
