const express = require('express')
const { authenticateJWT } = require('../middleware/auth')

const router = express.Router()

// Import controllers
const OrgController = require('../controllers/org')

// Import authentication middleware

// Routes
router.post('/signup', OrgController.signup)
router.post('/login', OrgController.login)
router.post('/logout', authenticateJWT, OrgController.logout)
router.post('/refresh', OrgController.refreshToken)
router.get('/org', authenticateJWT, OrgController.getOrg)
router.patch('/org', authenticateJWT, OrgController.updateOrg)
router.delete('/org', authenticateJWT, OrgController.deleteOrg)

module.exports = router
