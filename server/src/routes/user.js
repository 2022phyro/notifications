const express = require('express')
const { authenticateJWT } = require('../middleware/auth')
const UserController = require('../controllers/user')
const router = express.Router({ mergeParams: true })

router.get('/:userId', authenticateJWT, UserController.getUser)
router.delete('/:userId', authenticateJWT, UserController.deleteUser)
router.post('/:userId/unsubscribe', authenticateJWT, UserController.unsubscribe)
router.post('/:userId/subscribe', UserController.subscribe)
// router.delete('/app/user', authenticateJWT, UserController.deleteAllUsers)

module.exports = router
