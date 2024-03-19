const express = require('express')
const { authenticateJWT } = require('../middleware/auth')
const MessageController = require('../controllers/message')
const router = express.Router()


router.get('/app/messages/:id', authenticateJWT, MessageController.getMessage)
router.get('/app/messages', authenticateJWT, MessageController.getMessages)
router.patch('/app/messages/:id/read', authenticateJWT, MessageController.markAsRead)
router.delete('/app/message/:id', authenticateJWT, MessageController.deleteMessage)
router.delete('/app/messages', authenticateJWT, MessageController.deleteAllMessages)

module.exports = router
