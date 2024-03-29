const express = require('express')
const { authenticateJWT } = require('../middleware/auth')
const MessageController = require('../controllers/message')
const router = express.Router()

router.get('messages/:id', authenticateJWT, MessageController.getMessage)
router.get('messages', authenticateJWT, MessageController.getMessages)
router.get('messages/:id/read', authenticateJWT, MessageController.markAsRead)
router.delete('messages/:id', authenticateJWT, MessageController.deleteMessage)
router.delete('messages', authenticateJWT, MessageController.deleteAllMessages)

module.exports = router
