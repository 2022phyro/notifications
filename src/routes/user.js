const express = require('express')
const { authenticateJWT } = require('../middleware/auth')
const UserController = require('../controllers/user')
const router = express.Router()

router.get('users/:userId', authenticateJWT, UserController.getUser)
router.delete('users/:userId', authenticateJWT, UserController.deleteUser)
router.post('users/:userId/unsubscribe', authenticateJWT, UserController.unsubscribe)
router.post('users/:userId/subscribe', authenticateJWT, UserController.subscribe)
// router.delete('/app/user', authenticateJWT, UserController.deleteAllUsers)

module.exports = router
